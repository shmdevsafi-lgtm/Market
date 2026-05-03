# Cart Logic - Complete Specification

**Problem Solved** : Cart data loss on browser refresh, device change, or accidental logout.

**Solution** : Hybrid localStorage + Supabase DB sync

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GUEST (Not Authenticated)              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Browser localStorage                                    │
│  ├─ shm_cart_session (JSON)                             │
│  │  └─ items: CartItem[]                               │
│  │     └─ {productId, qty, attributes, price}          │
│  │  └─ lastSync: timestamp                             │
│  │                                                       │
│  Actions:                                               │
│  ├─ Add/Remove/Update → localStorage only              │
│  ├─ No API calls                                        │
│  ├─ Survives refresh ✓                                 │
│  └─ Lost on new device ✗ (acceptable for guest)       │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           REGISTERED (Authenticated User)               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Phase 1: Guest Cart (before login)                     │
│  ├─ localStorage: shm_cart_session                      │
│  ├─ On Login: POST /api/cart/sync                      │
│  │  └─ Merge guest items → DB                          │
│  │                                                       │
│  Phase 2: Server Cart (after login)                     │
│  ├─ DB: carts + cart_items                             │
│  ├─ localStorage: cache only (optional)                │
│  ├─ Single source of truth: SERVER                     │
│  └─ Real-time sync on changes                          │
│                                                           │
│  Actions:                                               │
│  ├─ Add item: POST /api/cart/items                     │
│  ├─ Remove item: DELETE /api/cart/items/:id            │
│  ├─ Update qty: PATCH /api/cart/items/:id              │
│  ├─ Get cart: GET /api/cart                            │
│  ├─ Clear cart: DELETE /api/cart                       │
│  └─ Checkout: POST /api/orders (with cart_id)         │
│                                                           │
│  Sync Strategy:                                         │
│  ├─ Every API response includes fresh cart state       │
│  ├─ localStorage updated from response                 │
│  ├─ Prevents race conditions                           │
│  └─ Server always authoritative                        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Data Structures

### localStorage (Guest + Registered Cache)

```json
{
  "shm_cart_session": {
    "id": "uuid-session-id",
    "items": [
      {
        "productId": "prod-uuid-001",
        "quantity": 2,
        "price": 150.00,
        "attributes": {
          "size": "L",
          "color": "noir",
          "customText": "My Text"
        }
      },
      {
        "productId": "prod-uuid-002",
        "quantity": 1,
        "price": 299.99,
        "attributes": null
      }
    ],
    "lastSync": 1704067200000
  }
}
```

### Supabase DB (Registered Only)

```sql
-- carts table
CREATE TABLE carts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id VARCHAR(255),  -- For guest-to-registered migration
  status VARCHAR(50) DEFAULT 'active',  -- active, checked_out, abandoned
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- cart_items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts(id),
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  attributes JSONB,  -- {"size": "L", "color": "noir", ...}
  created_at TIMESTAMP
);
```

---

## Frontend Flow

### 1. Add to Cart (Guest)

```typescript
async function addToCart(productId: string, qty: number, attrs?: Record) {
  // Read current cart from localStorage
  let cart = getFromLocalStorage('shm_cart_session');
  if (!cart) {
    cart = {
      id: crypto.randomUUID(),
      items: [],
      lastSync: Date.now(),
    };
  }

  // Add/update item
  const existing = cart.items.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    const product = await getProduct(productId);  // Fetch current price
    cart.items.push({
      productId,
      quantity: qty,
      price: product.price,
      attributes: attrs || null,
    });
  }

  // Save to localStorage
  saveToLocalStorage('shm_cart_session', cart);

  // Show toast
  showToast(`${product.title} ajouté au panier`);
}
```

### 2. Add to Cart (Registered)

```typescript
async function addToCart(productId: string, qty: number, attrs?: Record) {
  const { userProfile } = useAuth();
  if (!userProfile) {
    // Not logged in, use guest flow
    return addToCartGuest(productId, qty, attrs);
  }

  // User is authenticated - use backend
  const response = await fetch('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity: qty, attributes: attrs }),
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const result = await response.json();
  // result.cart contains fresh cart state

  // Update local cache from response
  updateLocalStorageFromResponse(result.cart);

  showToast(`${result.product.title} ajouté au panier`);
}
```

### 3. Sync Guest Cart on Login

```typescript
async function onLoginSuccess(token: string, userProfile: UserProfile) {
  // Check if guest had items
  const guestCart = getFromLocalStorage('shm_cart_session');

  if (guestCart && guestCart.items.length > 0) {
    // Sync guest items to server
    await fetch('/api/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items: guestCart.items }),
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }

  // Clear guest cart
  localStorage.removeItem('shm_cart_session');

  // Redirect to cart or continue
  navigate('/cart');
}
```

### 4. Get Cart (Display)

```typescript
async function getCartForDisplay() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    // Guest: read from localStorage
    return getFromLocalStorage('shm_cart_session') || emptyCart();
  }

  // Registered: fetch from server
  const response = await fetch('/api/cart', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  return response.json();
}
```

### 5. Checkout (Both Guest + Registered)

**Guest Flow** :
1. Click "Checkout"
2. Redirect to `/login?next=/checkout`
3. User logs in
4. Guest cart synced (see step 3)
5. Continue to checkout form

**Registered Flow** :
1. Click "Checkout"
2. GET `/api/cart` to get current state
3. POST `/api/orders` with cart_id, address_id, payment method
4. Server validates prices, creates order
5. Redirect to PayPal or success

---

## Backend Endpoints

### `POST /api/cart/sync`

Merge guest cart items into user's database cart.

```typescript
// Request
POST /api/cart/sync
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "attributes": { "size": "L" }
    }
  ]
}

// Response (200 OK)
{
  "cart": {
    "id": "uuid",
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "quantity": 2,
        "attributes": { "size": "L" }
      }
    ],
    "lastSync": 1704067200000
  }
}
```

### `GET /api/cart`

Get authenticated user's cart.

```typescript
// Response
{
  "id": "uuid",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "product": {
        "id": "uuid",
        "title": "Polo SHM",
        "price": 150,
        "images": [...]
      },
      "quantity": 2,
      "attributes": { "size": "L" }
    }
  ],
  "pricing": {
    "subtotal": 300,
    "fees": 0,
    "shipping": 15,
    "total": 315
  }
}
```

### `POST /api/cart/items`

Add item to authenticated user's cart.

```typescript
// Request
POST /api/cart/items
{
  "productId": "uuid",
  "quantity": 1,
  "attributes": { "size": "L", "color": "noir" }
}

// Response
{
  "cartItem": { ... },
  "cart": { ... }
}
```

### `DELETE /api/cart/items/:id`

Remove item from cart.

### `PATCH /api/cart/items/:id`

Update item quantity or attributes.

### `DELETE /api/cart`

Clear entire cart.

---

## Edge Cases & Resolutions

| Case | Guest | Registered | Solution |
|------|-------|-----------|----------|
| **Refresh page** | localStorage ✓ | API fetch ✓ | Both preserved |
| **Open in new tab** | Same browser localStorage ✓ | Re-auth via token ✓ | Session preserved |
| **New device** | Lost ✗ | API ✓ | Acceptable trade-off |
| **Logout** | localStorage persists (converted to guest) | DB cart persists (user can log back in) | Safe |
| **Add while login in progress** | Guest mode | Optimistic update | Queue & retry |
| **Concurrent adds** | localStorage (one-at-a-time UI) | Server conflict resolution | Last-write-wins |

---

## Performance Considerations

### Caching Strategy

```typescript
// Frontend cache rules
1. Guest cart: localStorage (no expiry)
2. Registered cart: localStorage + server sync
3. Product details: React Query (5 min stale)
4. Cart state: Refetch before checkout
```

### Server-Side Optimization

```sql
-- Index on frequently queried columns
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_carts_user_id ON carts(user_id);

-- Batch operations
-- When user adds 5 items: single transaction
BEGIN;
  INSERT INTO cart_items (...) VALUES (...), (...), ...;
  UPDATE carts SET updated_at = now() WHERE id = ?;
COMMIT;
```

---

## Testing Checklist

- [ ] Guest adds item, refreshes → item persists
- [ ] Guest adds item, logs in → items sync to DB
- [ ] Registered user adds item → appears in DB + localStorage
- [ ] Registered user logs out → cart preserved for guest
- [ ] Checkout starts with empty cart (cleared after order)
- [ ] Multiple tabs: add in tab A, see in tab B (requires polling or WebSocket)
- [ ] Offline guest adds item → persists on reconnect
- [ ] Concurrent adds don't create duplicates

---

## Migration Path

### Launch v1
- Guest cart: localStorage only
- Registered: DB cart (manual sync on login)

### v1.5 (Future)
- Add localStorage caching for registered users
- Implement WebSocket for real-time sync

### v2 (Future)
- Abandoned cart recovery emails
- Cart analytics (what items abandoned?)

---

**End CART_LOGIC.md**
