# Vendor demo mode

The customer and rider app has its own demo: see [customer/README.md](customer/README.md).

Runs the whole vendor app on bundled sample data, so every screen and form can
be tried without the Stuqet API, a network or a backend account.

```bash
npm run dev:vendor:demo     # EXPO_PUBLIC_ROUTE=vendor EXPO_PUBLIC_DEMO_MODE=true
```

Then press `i` for the iOS simulator. Nothing else needs configuring.

## How it works

`src/lib/config/axios.ts` swaps the adapter of both axios instances for
`adapter.ts` when `EXPO_PUBLIC_DEMO_MODE="true"`. Every feature keeps calling
its own `api.ts`, so the real hooks, mappers and screens run unchanged; only the
HTTP layer is replaced. `handlers.ts` answers each endpoint of
`/api/v2/seller/*` (plus auth, notifications, business settings and the image
upload) from an in-memory store (`db.ts`). Changes persist until the app
reloads or you use **More > Demo tools > Reset demo data**.

The code is loaded with `require()` behind a literal
`process.env.EXPO_PUBLIC_DEMO_MODE === "true"` check, so release builds drop the
data and images. Keep that pattern when you add a new call site.

## Sign in

Every account uses the password `Demo@1234`. On the login screen tap a chip to
fill it in.

| Chip            | Email                   | What it shows                                                      |
| --------------- | ----------------------- | ------------------------------------------------------------------ |
| Products + food | `shop@campusmart.com`   | Campus Mart: products and food, five tabs                          |
| Food shop       | `kitchen@mamangozi.com` | Mama Ngozi's Kitchen: food only                                    |
| Service shop    | `hello@campusfixit.com` | Campus Fix-It: services, three tabs                                |
| Under review    | `review@stuqet.com`     | Under-review screen; approved on the 2nd check, then an empty shop |
| Suspended       | `suspended@stuqet.com`  | Suspended screen                                                   |

Phone sign-in works with the numbers in `data/accounts.ts`. A wrong password or
unknown email shows the real error states. Forgot password: any account email
works and the code is `123456` (the reset screen has a fill chip).

## What is in the data

| Area              | Data                                                                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shop              | `data/shops.ts` (logo, banners, bank details, verification state)                                                                                                                  |
| Catalogue         | `data/catalogue.ts`: 14 products + 8 food (Campus Mart), 12 food (kitchen), 7 services; published/unpublished, out of stock, awaiting approval, scheduled, sold out, limited stock |
| Categories        | `data/categories.ts`: one tree shared by products, food and services                                                                                                               |
| Orders            | `data/orders.ts`: 24 / 12 / 6 orders in every delivery status, paid and unpaid, COD, card and bank transfer                                                                        |
| Messages          | `data/messages.ts`: 5 / 2 / 2 chats; the customer answers 4 seconds after you send                                                                                                 |
| Notifications     | `data/notifications.ts`: orders, products, payouts, verification, some unread                                                                                                      |
| Money             | `data/money.ts`: 12 payments, 11 withdrawals (one pending), commissions at 10%                                                                                                     |
| Support tickets   | `data/support.ts`: pending, open and solved; support replies 6 seconds after you                                                                                                   |
| Verification form | `data/verification.ts`: text, file, select, multi-select and radio fields                                                                                                          |
| Images            | `images/`: 40 generated illustrations (see below)                                                                                                                                  |

Dates are relative to when the app starts, so orders and chats always look
recent.

## Forms

Every form shows a dashed **Fill with sample data** chip in demo mode (add
product, add food, add service, shop settings, payout details, withdraw,
verification, support ticket, forgot and reset password). Sample values live in
`samples.ts`; tapping again loads the next variant.

The camera and photo library return bundled illustrations (`picker.ts`)
instead of opening the system picker, and document rows pick a sample PDF or ID
image. Uploaded photos show immediately as the listing thumbnail or logo.

Handy checks:

- Payout: account number `0000000000` shows "account not found"; any other
  10 digits fills in a bank-confirmed name.
- Withdraw: below ₦1,000 or above the balance is refused.
- Orders: delivered and cancelled orders are locked; marking an order delivered
  adds a commission row and moves the balance.

## Demo tools (More screen)

Reset demo data, force the Session expired screen, and a "Simulate no
connection" switch that makes every request fail.

## Images

`scripts/generate-demo-images.py` draws the illustrations with Pillow and
rewrites `images/index.ts`:

```bash
npm run demo:images
```

They are flat illustrations, not photographs. To use a real photo, replace the
file with one of the same name and keep the extension.

## Not covered

- Fingerprint unlock needs a simulator with Face ID enrolled
  (Features > Face ID > Enrolled).
- Push notifications and the bank, Paystack and email services are not
  simulated; the screens that depend on them use the fake responses above.
