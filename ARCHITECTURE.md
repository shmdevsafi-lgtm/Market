# SHM Marketplace - Architecture Globale

**Version** : 1.0 (PHASE 0)  
**Status** : Spécification définitive avant implémentation  
**Dernière révision** : 2026-04-28

---

## 1. VISION GLOBALE

SHM Marketplace est une **plateforme e-commerce B2C** marocaine avec :
- Catalogue public (tous accès)
- Panier intelligent (guest + registered)
- Authentification Supabase
- 4 rôles d'utilisateurs (scalabilité)
- Tarification backend-only (sécurité)
- Adresses multiples (UX checkout)
- Intégration PayPal
- Ajout produits scouts autorisés

---

## 2. RÔLES & PERMISSIONS

### **4 Rôles**

```
CUSTOMER (défaut)
├─ Browse catalog
├─ View product details
├─ Add to cart
├─ Checkout (+ address management)
├─ View own orders
└─ Pricing rule: normal tarifation

SCOUT (après authentification + verify dans DB)
├─ Tous droits CUSTOMER
├─ POST /api/products (ajout)
├─ GET /api/products/mine (ses produits)
├─ PATCH /api/products/:id (ses seuls)
├─ DELETE /api/products/:id (ses seul)
└─ Pricing rule: +5% + 10 MAD fixe

MANAGER (internal - FUTURE v2)
├─ Tous droits SCOUT
├─ Modérer produits
├─ Stats/analytics basiques
└─ Commission management

ADMIN (full control)
├─ All endpoints
├─ User management
├─ Full analytics
└─ System config
```

### **Matrice Permissions par Endpoint**

| Endpoint | Public | Customer | Scout | Manager | Admin |
|----------|--------|----------|-------|---------|-------|
| `GET /api/products` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `GET /api/products/:id` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `POST /api/products` | ✗ | ✗ | ✓ | ✓ | ✓ |
| `PATCH /api/products/:id` | ✗ | ✗ | (own) | ✓ | ✓ |
| `DELETE /api/products/:id` | ✗ | ✗ | (own) | ✓ | ✓ |
| `GET /api/cart` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `POST /api/orders` | ✗ | ✓ | ✓ | ✓ | ✓ |
| `GET /api/orders` | ✗ | (own) | (own) | ✓ | ✓ |
| `POST /api/paypal/order` | ✗ | ✓ | ✓ | ✓ | ✓ |

---

## 3. DATA FLOW GLOBAL

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
├─────────────────────────────────────────────────────────┤
│  Home | Catalog | ProductDetail | Cart | Checkout | Auth │
└──────────────────────┬──────────────────────────────────┘
                       │ API Calls
                       ▼
┌─────────────────────────────────────────────────────────┐
│               BACKEND (Express.js)                       │
├─────────────────────────────────────────────────────────┤
│  ├─ Auth Service (register/login/roles)                 │
│  ├─ Product Service (CRUD + attributes)                 │
│  ├─ Cart Service (pricing engine)                       │
│  ├─ Order Service (order creation)                      │
│  ├─ PayPal Service (order verification)                 │
│  └─ Auth Middleware (JWT + role check)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL Queries
                       ▼
┌─────────────────────────────────────────────────────────┐
│            SUPABASE (PostgreSQL)                        │
├─────────────────────────────────────────────────────────┤
│  ├─ auth.users (Supabase Auth)                          │
│  ├─ profiles (custom user data)                         │
│  ├─ roles (role definitions)                            │
│  ├─ products (catalog)                                  │
│  ├─ product_images (gallery)                            │
│  ├─ product_attributes (textile/camping/medical specs)  │
│  ├─ carts (shopping sessions)                           │
│  ├─ cart_items (per-user cart content)                  │
│  ├─ orders (order records)                              │
│  ├─ order_items (order line items)                      │
│  ├─ addresses (user delivery addresses)                 │
│  ├─ reviews (product reviews)                           │
│  └─ RLS Policies (security layer)                       │
└─────────────────────────────────────────────────────────┘
                       │ File Storage
                       ▼
┌─────────────────────────────────────────────────────────┐
│         SUPABASE STORAGE (Images)                       │
├─────────────────────────────────────────────────────────┤
│  /products/{productId}/*.jpg (product images)           │
│  /users/{userId}/*.jpg (profile avatars - future)       │
└─────────────────────────────────────────────────────────┘
```

---

## 4. PRICING ENGINE (TRÈS CRITIQUE)

### **Principe**
- **Frontend ne calcule JAMAIS les prix**
- **Backend calcule 100% des montants**
- Endpoint : `POST /api/cart/calculate`
- Input : `{ items: [{productId, qty}], userId?, cityId? }`
- Output : `{ subtotal, fees, shipping, total, breakdown: {...} }`

### **Règles CUSTOMER**

```javascript
// CUSTOMER Normal (role='customer')

if (subtotal < 100 MAD) {
  fees += 10;  // Frais petite commande
}

shipping = (city === 'Safi') ? 15 : 40;

total = subtotal + fees + shipping;
```

**Table Livraison** :
```
City         | Shipping
─────────────┼──────────
Safi         | 15 MAD
Autres villes| 40 MAD
```

### **Règles SCOUT**

```javascript
// SCOUT (role='scout')
// TOUJOURS appliqué, peu importe subtotal

commission = subtotal * 0.05;  // +5%
fixedFee = 10;                 // +10 MAD

total = subtotal + commission + fixedFee;
// Livraison: identique customer
```

### **Cas limites**

| Cas | Subtotal | Fees | Shipping | Total |
|-----|----------|------|----------|-------|
| CUSTOMER < 100, Safi | 80 MAD | +10 | +15 | **105 MAD** |
| CUSTOMER < 100, Marrakech | 80 MAD | +10 | +40 | **130 MAD** |
| CUSTOMER 100-299, Safi | 150 MAD | 0 | +15 | **165 MAD** |
| CUSTOMER 300-499, Safi | 350 MAD | 0 | 0 | **350 MAD** |
| CUSTOMER ≥ 500, any | 500 MAD | 0 | 0 | **500 MAD** |
| SCOUT (any), Safi | 100 MAD | +5 (5%) | +15 | **120 MAD** |

### **Implémentation**

```typescript
// server/lib/pricingEngine.ts

export interface PricingResult {
  subtotal: number;
  fees: number;
  shipping: number;
  total: number;
  breakdown: {
    smallOrderFee?: number;
    scoutCommission?: number;
    scoutFixed?: number;
    shipping: number;
  };
}

export function calculatePrice(
  subtotal: number,
  role: 'customer' | 'scout' | 'manager' | 'admin',
  city: string
): PricingResult {
  
  let fees = 0;
  let shipping = getShippingCost(city);
  const breakdown = { shipping };

  if (role === 'customer') {
    if (subtotal < 100) {
      fees = 10;
      breakdown.smallOrderFee = 10;
    }
  } else if (role === 'scout') {
    const commission = Math.round(subtotal * 0.05 * 100) / 100;
    fees = commission + 10;
    breakdown.scoutCommission = commission;
    breakdown.scoutFixed = 10;
  }

  return {
    subtotal,
    fees,
    shipping,
    total: subtotal + fees + shipping,
    breakdown
  };
}

function getShippingCost(city: string): number {
  return city.toLowerCase() === 'safi' ? 15 : 40;
}
```

---

## 5. CART LOGIC

### **Principes**
- **Guest** (non auth) : localStorage seulement
- **Logged in** : localStorage + DB sync automatique
- **Checkout** : redirect login si guest

### **Structure localStorage**

```json
{
  "shm_cart_session": {
    "id": "temp-uuid",
    "items": [
      { "productId": "prod-1", "qty": 2, "attributes": {"size": "L"} }
    ],
    "lastSync": 1704067200000
  }
}
```

### **Structure DB (carts table)**

```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  attributes JSONB,  -- {"size": "L", "color": "noir", ...}
  created_at TIMESTAMP DEFAULT now()
);
```

### **Sync Logic (Frontend)**

```typescript
// client/lib/cartSync.ts

export async function syncCartToServer() {
  const sessionCart = localStorage.getItem('shm_cart_session');
  if (!sessionCart) return;
  
  const { items } = JSON.parse(sessionCart);
  
  // POST to /api/cart/sync
  await fetch('/api/cart/sync', {
    method: 'POST',
    body: JSON.stringify({ items }),
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Clear session cart after sync
  localStorage.removeItem('shm_cart_session');
}
```

---

## 6. AUTHENTICATION FLOW

### **Register**

1. User POST `/api/auth/register` avec :
   - email, password
   - nom, prenom, telephone
   - region, ville, adresse
2. Backend crée `auth.users` + `profiles` (role='customer')
3. Frontend sauvegarde JWT token
4. Redirect `/` (catalog)

### **Login**

1. User POST `/api/auth/login` avec : email, password
2. Backend valide + retourne JWT + userProfile
3. Frontend sauvegarde token + profile
4. Si guest avait panier → sync au server
5. Redirect `/` ou page précédente

### **Scout Verification**

- Scout role déterminé dans `profiles.role`
- Backend middleware vérifie lors POST `/api/products`
- Frontend cache `/scout/add-product` si `userProfile.role !== 'scout'`

---

## 7. PRODUCT ATTRIBUTES (CRITIQUE)

### **Problème éludé**
Éviter if/else frontend :
```javascript
// ❌ MAUVAIS
if (category === 'textile') showTextileFields();
if (category === 'camping') showCampingFields();
```

### **Solution : EAV Model**

```sql
CREATE TABLE product_attributes (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  key VARCHAR(100),  -- "size", "color", "weight", "material"
  value VARCHAR(500),
  unit VARCHAR(20),  -- "kg", "cm", "px"
  UNIQUE(product_id, key)
);
```

**Exemple données** :
```
product_id='textile-001' :
  └─ size: ["XS", "S", "M", "L", "XL"]
  └─ color: ["noir", "blanc", "bleu"]
  └─ material: "cotton 100%"

product_id='camping-001' :
  └─ weight: "2.5kg"
  └─ autonomy: "8h"
  └─ dimensions: "10x20x30cm"
```

### **Frontend (Dynamique)**

```typescript
// ProductDetail.tsx

const ProductDetail = ({ productId }) => {
  const product = await getProduct(productId);
  const attributes = await getProductAttributes(productId);
  
  return (
    <>
      <h1>{product.title}</h1>
      <div className="attributes">
        {attributes.map(attr => (
          <AttributeInput key={attr.key} {...attr} />
        ))}
      </div>
    </>
  );
};
```

---

## 8. ADDRESSES (Multi-address Support)

### **Table Schema**

```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  label VARCHAR(50),  -- "Domicile", "Bureau", etc.
  full_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10),
  phone VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, is_default) -- Un seul défaut par user
);
```

### **Checkout Flow**

1. GET `/api/addresses` → liste adresses
2. Utiliser défaut ou sélectionner
3. POST `/api/orders` avec `address_id`

---

## 9. PAYPAL SANDBOX SETUP

### **Credentials (Environment)**

```bash
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=yyyyy
PAYPAL_API_URL=https://api-m.sandbox.paypal.com  # Sandbox
```

### **Restrictions Maroc**

⚠️ **IMPORTANT** : PayPal peut ne pas supporter MAD directement.
- Vérifier : https://developer.paypal.com/docs/checkout/reference/country-codes
- Alternative : Convertir MAD → EUR/USD temporaire
- Ou : Stripe/autre payment gateway

### **Test Checklist**

- [ ] Credentials validés
- [ ] Sandbox order creation OK
- [ ] Currency MAD ou conversion OK
- [ ] Webhook capture OK
- [ ] Error handling OK

---

## 10. PROCHAINES ÉTAPES

### **PHASE 0 (Validation)**
1. ✅ Schéma SQL créé + RLS policies
2. ✅ Pricing engine testé (tous cas limites)
3. ✅ PayPal sandbox validé
4. ✅ Cart logic spécifiée
5. ✅ Rôles et permissions documentés

### **PHASE 1-12 (Implémentation)**
- Backend routes + auth
- Frontend UI par couche
- Tests de bout en bout

---

## 11. CONVENTIONS CODE

### **Backend**
- Express routes en `/server/routes/`
- Services en `/server/services/`
- Types en `@shared/types.ts`
- Errors standardisés

### **Frontend**
- Pages en `/client/pages/`
- Components réutilisables en `/client/components/`
- Services d'API en `/client/services/`
- Contexts en `/client/context/`
- Hooks en `/client/hooks/`

### **Database**
- Tables all_lowercase
- Columns snake_case
- PK: id UUID
- FK: table_name_id
- Timestamps: created_at, updated_at

---

## 12. SÉCURITÉ

### **RLS (Row Level Security)**
- `profiles` : visible si owner ou admin
- `carts` : visible si owner
- `orders` : visible si owner ou manager+
- `products` : public readable, scout-only writable (own)

### **Auth Middleware**
- Vérifie JWT token sur routes protégées
- Attache `user` + `role` à request
- Rejette si rôle insuffisant

### **Validation**
- Zod schemas pour inputs
- Backend ne fait JAMAIS confiance frontend
- Prices calculés côté serveur

---

**Fin ARCHITECTURE.md**

Cette spécification est **définitive** avant implémentation.  
Toute déviation doit être documentée.
