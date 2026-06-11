# Payment Security Architecture

## ✅ Security Layers Implemented

### 1. **Client-Side Price Removal (Most Critical)**
- ❌ Client-calculated `totalCost` is **NOT** sent to payment API
- ✅ Only booking parameters (rental type, duration, pickup, etc.) are sent
- ✅ Server recalculates ALL prices from scratch using official pricing tables
- **Location:** `app/checkout/page.tsx` - paymentDetails excludes totalCost

### 2. **Server-Side Input Validation**
All booking parameters are validated server-side to ensure they match business rules:

#### Rental Type Validation
- ✅ Must be one of: "Boat", "Jet Ski", "Boat+Jet Ski"
- ❌ Rejects any other rental type

#### Location Validation
- ✅ Pickup location must be in allowed list (San Juan, Luquillo, Fajardo, Ceiba, Naguabo)
- ✅ Destination must be in allowed list (Icacos, Palomino, Piñero, Culebra)
- ❌ Rejects invalid pickup/destination combinations

#### Duration Validation
- ✅ Boat: 1-9 hours, must be integer, respects minimum duration per route
- ✅ Jet Ski: 15min-9hours, must match available durations at pickup location
- ❌ Rejects durations outside allowed range
- ❌ Rejects minimum duration violations

#### Water Sports Validation
- ✅ Sport name must exist in official WATER_SPORT_COSTS table
- ✅ People count must be 1-6 per sport, must be integer
- ✅ Defaults to 1 person if count is invalid
- ❌ Rejects unknown sports
- ❌ Rejects invalid people counts

#### Equipment Validation
- ✅ Maximum 3 jet skis per booking
- ✅ Jet ski count must be integer >= 0
- ❌ Rejects excessive jet ski counts

### 3. **Server-Side Price Recalculation**
```
Price Calculation = Base Rental + Water Sports + Tax - Discount
```

#### Base Rental (from pricing table, NOT client input)
- Boat: Uses fixed hourly rates from BOAT_HOURLY_RATES
- Jet Ski: Calculated based on # skis × duration × location-specific pricing
- Package: Interpolated from BOAT_JETSKI_PACKAGE_PRICES table

#### Water Sports (recalculated, NOT trusted from client)
- Each sport cost = WATER_SPORT_COSTS[sport].cost × people_count
- All people counts validated and sanitized (max 6)

#### Tax
- Applied at TAX_RATE (11.5%) on subtotal
- Calculated server-side only

#### Discount
- Validated from Sanity backend
- Checked: active flag, validFrom date, validUntil date, usage limit
- Applied only if ALL checks pass

### 4. **Stripe Payment Intent Creation**
- ✅ Amount calculated server-side: `Math.round(totalCost * 100)` (in cents)
- ✅ Amount must be > 0, rejects zero/negative amounts
- ✅ Amount is created in Stripe, becomes immutable
- ✅ Client cannot modify Stripe payment intent amount

### 5. **Booking Date Normalization**
- ✅ Booking date sent as ISO format (YYYY-MM-DD) from success page
- ✅ Backend converts human-readable dates to ISO format before Sanity save
- ✅ Rejects invalid date formats with clear error
- ✅ Prevents date parsing exploits

### 6. **Audit Logging**
Every payment intent creation logs:
```
=== PAYMENT INTENT CALCULATION ===
Rental Type: [type]
Duration: [hours]h | Jet Skis: [count]
Base Rental: $[amount] | Water Sports: $[amount]
Subtotal: $[amount] | Tax: $[amount]
FINAL TOTAL: $[amount] ([cents] cents for Stripe)
=====================================
```
**Why:** Allows forensic review if hacking is suspected

### 7. **No Client-Side Total Trust**
- ✅ Checkout page displays `trustedTotalCost` from server response
- ✅ This is for **display only**
- ✅ Stripe amount is what's actually charged, not displayed amount
- ✅ If display amount ≠ Stripe amount, customer will notice

## 🔒 What Attackers CANNOT Do

### Hack #1: Modify totalCost in Redux
- ❌ Server ignores any totalCost sent by client
- ❌ Payment amount is recalculated from scratch

### Hack #2: Modify waterSport prices
- ❌ Server looks up sport names in official WATER_SPORT_COSTS table
- ❌ Cannot send custom prices, only sport name and people count
- ❌ Invalid people counts are sanitized to safe defaults

### Hack #3: Add invalid rental types
- ❌ Rental type is validated against whitelist
- ❌ Invalid types are rejected immediately

### Hack #4: Bypass location/duration validation
- ❌ All locations validated against official lists
- ❌ Durations validated by location and rental type
- ❌ Minimum duration rules enforced per route

### Hack #5: Create multiple jet skis for same price
- ❌ Jet ski pricing is tiered per number of skis
- ❌ Price = cost_per_ski × num_skis × duration_factor
- ❌ Cannot fake num_skis - it's validated and multiplies cost

### Hack #6: Inject discount code
- ❌ Discount code validated in Sanity backend
- ❌ Checked: active status, valid dates, usage limit
- ❌ Only valid codes are applied
- ❌ Invalid codes are ignored silently

### Hack #7: Manipulate Stripe amount after creation
- ❌ Stripe payment intent amount is immutable after creation
- ❌ Stripe is source of truth for charged amount
- ❌ Card processing uses Stripe amount, not client display amount

## 📊 Data Flow Security

```
CLIENT SIDE (Untrusted)
  ↓
  └─> Send: rentalType, pickup, duration, waterSport, people
  
SERVER SIDE (Trusted)
  ↓
  ├─> Validate all parameters against whitelists/rules
  ├─> Look up official prices from constants
  ├─> Recalculate: base + water sports + tax - discount
  └─> Create Stripe PaymentIntent with calculated amount (immutable)
  
CLIENT SIDE (Display Only)
  ↓
  └─> Display: trustedTotalCost from server response
  └─> Customer pays via Stripe (Stripe amount is authoritative)
```

## ✅ Testing Security

### To verify the system works:
1. Go through normal booking flow
2. Check browser console: verify totalCost is NOT sent in payment request
3. Check server logs: verify audit log shows calculated amounts
4. Check Stripe dashboard: verify charged amount matches calculation

### To test if hacking would work:
1. Try to inspect payment request and modify amounts → Will fail (amount not sent)
2. Try to modify localStorage bookingState → Will be ignored (server recalculates)
3. Try to add invalid rental type → Will be rejected (whitelist validation)
4. Try to add bogus water sport → Will be rejected (sport name validation)
5. Try to modify jet ski count in request → Will be recalculated based on validation

## 🚀 Recommended Additional Safeguards

### Future Enhancements:
1. **Rate limiting**: Limit payment intent creation per IP/user
2. **Request signing**: Sign requests with HMAC to detect tampering
3. **IP validation**: Only allow payment from US/Puerto Rico
4. **Webhook verification**: Verify Stripe webhook signatures
5. **Monitoring**: Alert on suspicious patterns (many failed attempts, unusual prices)

---

**Last Updated:** June 2026  
**Status:** HARDENED - Payment security implemented across all layers
