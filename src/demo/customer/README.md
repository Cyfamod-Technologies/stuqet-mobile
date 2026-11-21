# Customer and rider demo mode

Runs the whole customer app, both roles (customer and rider), on bundled sample
data, so every screen and form can be tried without the Stuqet API, a network
or a backend account. The vendor app has its own demo ([../README.md](../README.md)).

```bash
npm run dev:customer:demo -- --port 8092   # EXPO_PUBLIC_ROUTE=customer EXPO_PUBLIC_DEMO_MODE=true
```

Then open it in the iOS simulator. Nothing else needs configuring.

## How it works

`src/lib/config/axios.ts` swaps the adapter of both axios instances for
`adapter.ts` when `EXPO_PUBLIC_DEMO_MODE="true"` (the customer build loads
`~/demo/customer`, the vendor build `~/demo`). Every feature keeps calling its
own `api.ts`, so the real hooks and screens run unchanged; only the HTTP layer
is replaced. `router.ts` holds the route table, `handlers/` answers the
customer endpoints (auth, schools and places, addresses, notifications, food,
cart, checkout, orders, chat) and `../rider/handlers.ts` answers
`/delivery-boy/*`. `db.ts` and `../rider/db.ts` keep a mutable store per
account; changes persist until the app reloads or **Profile > Demo tools >
Reset demo data**.

The demo is loaded with `require()` behind a literal
`process.env.EXPO_PUBLIC_DEMO_MODE === "true"` check, so release builds drop the
data and images. Keep that pattern when you add a call site.

Routes that exist in the backend (`auth/*`, `schools`, `states`,
`user/shipping/*`, `delivery-boy/*`) use the real paths and shapes. The `/food/*`
routes and the rider application routes are proposals; each is marked
`TODO(backend)` in its feature's `api.ts`.

## Sign in

Every account uses the password `Demo@1234`. On the login screen tap a chip.

| Chip           | Email                    | What it shows                                                                         |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------- |
| Customer       | `ada@student.edu`        | Ada Okafor: two saved addresses, a cart with a coupon to try, orders in every status  |
| New customer   | `chidi@student.edu`      | Chidi Eze: nothing yet, so every empty state shows (cart, orders, notifications)      |
| Rider          | `tunde@rider.stuqet.com` | Tunde Adeyemi: approved, deliveries in every status, earnings, 18 finished deliveries |
| Rider (review) | `sade@rider.stuqet.com`  | Sade Bello: application under review; approved on the second check, then empty states |

Phone sign-in works with the numbers in `data/accounts.ts`. The login tries
customers first and then riders, like the real API needs (`user_type`).
Verification and reset codes are always `123456`. New accounts made through
**Create account** sign in with the password they set.

Switch sides without signing out: a rider taps Profile > **Switch to ordering
food**; a customer taps Profile > **Become a rider** (the application form, then
Under review) or **Switch to rider** once approved.

## What is in the data

| Area          | Data                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vendors       | `data/vendors.ts`: 8 vendors with generated logos and covers (one has no logo, so the initials tile shows; one is closed), ratings, prep and arrival times     |
| Dishes        | 30 dishes with pictures: sizes, add-ons, sold out, scheduled (12:00 to 15:00), a very long name, "500 ml" drinks                                               |
| Search        | trending searches, filters (Delivery, Pickup, Under ₦3,000), food types                                                                                        |
| Cart          | `data/cart.ts`: the Cart board (long name, four add-ons, a drink x2). Coupons: `WELCOME10` (10%, up to ₦500) and `CAMPUS20`; any other code is invalid         |
| Orders        | `data/orders.ts`: placed, confirmed, preparing, ready, picked up, on the way, delivered (rated and not) and cancelled                                          |
| Live tracking | an order you place walks through the statuses by itself (about 2 minutes) and the rider dot moves along the map route; Ada's first order is already on its way |
| Chat          | per order; the vendor answers 4 seconds after you write                                                                                                        |
| Notifications | customer and rider lists; order updates also arrive as the order progresses                                                                                    |
| Rider         | `../rider/data/deliveries.ts`: 3 assigned, 1 picked up, 1 on the way, 1 cancelled and 18 finished; earnings today ₦6,400, yesterday ₦5,200; cash ₦12,500       |
| Places        | `data/places.ts`: 12 schools, states, cities and areas, banks, food types                                                                                      |
| Images        | `images/`: generated illustrations (logos, covers, dishes, map, vehicle, documents); food and people are shared with the vendor demo                           |

Dates are relative to when the app starts.

## Forms

Every form shows a dashed **Fill with sample data** chip in demo mode (create
account, address, coupon, review, chat message, rider profile, vehicle,
documents, payout, forgot and reset password). Sample values live in
`samples.ts`; tapping again loads the next variant. The camera and library
return bundled pictures (`picker.ts`).

Handy checks:

- Payout: account number `0000000000` shows "We could not find this account";
  `0123456789` fills in "Tunde Adeyemi"; any other 10 digits find a name.
- Checkout: an account with no address is asked to add one first.
- Cart: a dish from another vendor asks to start a new cart.
- Rider: "Mark as delivered" on a cash order needs the "I collected" tick.

## Demo tools (Profile)

Reset demo data, force a 401 (back to the login screen), simulate no connection
and, for riders, **Assign me a delivery** (adds one to Home and Deliveries).

## Images

`scripts/generate-demo-customer-images.py` draws the new illustrations with
Pillow and rewrites `images/index.ts`:

```bash
npm run demo:images:customer
```

They are flat illustrations, not photographs. To use a real photo, replace the
file with one of the same name and keep the extension.

## Not covered

- Real maps: the track screen draws the rider on a bundled map picture
  (`data/track.ts` holds the route, which must match the Python script).
- Push notifications and Paystack are not simulated; "Pay online" counts as paid.
- Fingerprint unlock needs a simulator with Face ID enrolled.
