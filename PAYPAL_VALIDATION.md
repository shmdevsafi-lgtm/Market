# PayPal Sandbox Validation - PHASE 0

**Objective** : Validate PayPal integration is viable BEFORE building payment flow UI.

**Deadline** : BEFORE Phase 9 (Checkout implementation)

---

## 1. Prerequisites Checklist

- [ ] PayPal Developer Account created (https://developer.paypal.com)
- [ ] Business/Sandbox account ready
- [ ] PayPal CLI installed (optional, for testing)
- [ ] Test merchant account (sandbox)
- [ ] Test buyer account (sandbox)

---

## 2. Credentials Validation

### Check Your PayPal Sandbox Setup

**Step 1** : Go to https://developer.paypal.com/dashboard/

**Step 2** : Navigate to **Sandbox** (not Live)

**Step 3** : Copy credentials:

```bash
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_URL=https://yourserver.com/api/paypal/webhook (optional for v1)
```

**Step 4** : Verify in terminal:

```bash
curl -X POST https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=client_credentials"

# Should return:
# {
#   "scope": "https://api.paypal.com/v1/payments/.*",
#   "access_token": "...",
#   "token_type": "Bearer",
#   "app_id": "...",
#   "expires_in": 3600
# }
```

**Status** : ✓ Credentials valid | ✗ Fix permissions

---

## 3. Currency & Country Restrictions

### Critical: Does PayPal Support MAD (Moroccan Dirham)?

**Check** : https://developer.paypal.com/docs/checkout/reference/country-codes

**Moroccan Region** :
- Country Code: MA
- Currency: MAD
- Status: ❓ CHECK (PayPal may not support all currencies)

### If MAD Not Supported

**Options** :

1. **Use EUR/USD Conversion**
   ```javascript
   // MAD → EUR conversion
   const eurAmount = madAmount * 0.092; // Approximate
   // Send to PayPal in EUR
   ```

2. **Alternative Payment Gateway**
   - Stripe (supports MAD)
   - 2Checkout
   - Local gateway

3. **Request PayPal Support**
   - Contact PayPal for merchant enablement

---

## 4. Sandbox Transactions Test

### Test Case 1: Simple Order Creation

```bash
curl -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -d '{
    "intent": "CAPTURE",
    "purchase_units": [
      {
        "amount": {
          "currency_code": "EUR",
          "value": "100.00"
        }
      }
    ]
  }'

# Response should be:
# {
#   "id": "order-id-12345",
#   "status": "CREATED",
#   "links": [...]
# }
```

**Status** : ✓ Order created | ✗ Check error response

### Test Case 2: Capture Payment

```bash
curl -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{ORDER_ID}/capture \
  -H "Authorization: Bearer ACCESS_TOKEN"

# Response:
# {
#   "id": "order-id-12345",
#   "status": "COMPLETED",
#   "purchase_units": [...]
# }
```

**Status** : ✓ Payment captured | ✗ Debug

---

## 5. Integration Test (Your Backend)

### Create Test API Endpoint

```typescript
// server/routes/paypal-test.ts

app.post('/api/paypal/test', async (req, res) => {
  const { amount } = req.body;

  try {
    // 1. Create order
    const orderResponse = await fetch(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'EUR', // or MAD if supported
                value: amount.toString(),
              },
            },
          ],
        }),
      }
    );

    const order = await orderResponse.json();

    if (order.id) {
      res.json({ success: true, orderId: order.id });
    } else {
      res.status(400).json({ error: order });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Test with Real Amount

```bash
POST http://localhost:8080/api/paypal/test
{
  "amount": 123.45
}

# Expected response:
# {
#   "success": true,
#   "orderId": "3J5...",
#   "approvalLink": "https://sandbox.paypal.com/checkoutnow?token=..."
# }
```

---

## 6. Webhook Testing (Optional for v1)

If you want payment notifications:

```bash
# Step 1: Create webhook subscription
curl -X POST https://api-m.sandbox.paypal.com/v1/notifications/webhooks \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "url": "https://yourserver.com/api/paypal/webhook",
    "event_types": [
      { "name": "CHECKOUT.ORDER.COMPLETED" },
      { "name": "CHECKOUT.ORDER.APPROVED" }
    ]
  }'

# Step 2: Test webhook
# Use PayPal webhook simulator or trigger manually
```

---

## 7. Error Scenarios Testing

### Test Case: Invalid Amount

```json
{
  "amount": -100  // Negative
}

// Expected: 400 Bad Request
```

**Status** : ✓ Properly rejected | ✗ Need validation

### Test Case: Currency Mismatch

```json
{
  "amount": 100,
  "currency": "XYZ"  // Invalid
}

// Expected: 400 Bad Request
```

**Status** : ✓ Handled | ✗ Add validation

### Test Case: Malformed Request

```json
{
  // Missing amount
}

// Expected: 400 Bad Request with error message
```

---

## 8. Sandbox Buyer Testing

1. Log in as **sandbox buyer** account
2. Go to PayPal checkout
3. Complete payment
4. Verify order status in PayPal dashboard

---

## 9. Security Checklist

- [ ] Client ID never exposed in frontend (backend-only)
- [ ] Client Secret never in version control (use env vars)
- [ ] All requests use HTTPS (production)
- [ ] Webhook signatures verified
- [ ] CSRF tokens on payment forms
- [ ] Rate limiting on payment endpoints

---

## 10. Final Validation Report

### Template

```
┌────────────────────────────────────────┐
│  PAYPAL SANDBOX VALIDATION REPORT      │
├────────────────────────────────────────┤
│ ✓ Credentials valid & working          │
│ ✓ Sandbox orders created successfully  │
│ ✓ Payments captured working            │
│ ✓ Currency/Country supported           │
│ ✓ Error handling in place              │
│ ✓ Webhook (optional) configured        │
│                                         │
│ Status: READY FOR PRODUCTION            │
│ Date: 2026-04-28                        │
│ Tested by: [Your Name]                 │
└────────────────────────────────────────┘
```

---

## 11. Decision Flow

```
START
  │
  ├─ Can create sandbox order?
  │  ├─ YES → Continue
  │  └─ NO → Fix credentials → RETRY
  │
  ├─ Currency supported (MAD or EUR)?
  │  ├─ YES → Continue
  │  └─ NO → Choose alt gateway (Stripe) → UPDATE PLAN
  │
  ├─ Can capture payment?
  │  ├─ YES → Continue
  │  └─ NO → Debug API → RETRY
  │
  └─ PHASE 0 COMPLETE ✓
     → Proceed to PHASE 1 implementation
```

---

## 12. Resources

- [PayPal Checkout Integration](https://developer.paypal.com/docs/checkout/integrate/)
- [Sandbox Testing Guide](https://developer.paypal.com/docs/platforms/develop-in-sandbox/)
- [API Reference](https://developer.paypal.com/api/checkout/order-create/)
- [Webhook Events](https://developer.paypal.com/api/webhooks/event-names/)

---

## Next Steps

1. **Complete validation checklist above**
2. **Document results in "Final Validation Report"**
3. **If all ✓ → Approve PHASE 0**
4. **If ✗ → Fix issues before proceeding**

---

**End PAYPAL_VALIDATION.md**
