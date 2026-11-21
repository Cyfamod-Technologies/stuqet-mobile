# Design System

The Stuqet look, shared by the customer and vendor apps. It was designed on the
vendor-auth and customer-onboarding design canvases and lives in code as tokens
plus a small UI kit, so screens never hard-code colours, radii or fonts.

## Principles

- **Off-white screens, white fields.** Screens sit on `background`
  (`#FBFAF8`); inputs and cards are pure white with a hairline border and a soft
  shadow, so they stay visible without heavy outlines.
- **One loud thing per screen.** The orange pill button is the only filled brand
  element; everything else (social buttons, outline buttons) is white.
- **Light first, dark ready.** Every token has a light and a dark value and
  switches with the theme store; components never branch on theme themselves.

## Typography — Urbanist

Loaded in both root layouts via `@expo-google-fonts/urbanist`. React Native
ignores `fontWeight` for custom fonts on Android, so the weight is part of the
family: use `font-sans`, `font-sans-medium`, `font-sans-semibold`,
`font-sans-bold`, `font-sans-extrabold` — never `font-bold`.

Use `Text` from `~/components/ui/text` so every string gets the app font:

| Variant       | Style                          | Use                                  |
| ------------- | ------------------------------ | ------------------------------------ |
| `display`     | 32/38 extrabold                | Screen hero titles                   |
| `screenTitle` | 30/36 extrabold, -0.5 tracking | Root-tab title (`ScreenHeader`)      |
| `headerTitle` | 21/26 extrabold, -0.2 tracking | Pushed-screen title (`ScreenHeader`) |
| `sheetTitle`  | 22/28 extrabold                | Bottom-sheet title                   |
| `title`       | 24/32 bold                     | Section titles, OTP                  |
| `heading`     | 18/24 bold                     | Card and list headings               |
| `body`        | 16/24 regular                  | Paragraphs                           |
| `label`       | 14/18 semibold                 | Field labels                         |
| `meta`        | 13/18 medium, muted            | Row subtitles                        |
| `caption`     | 12/16 regular, muted           | Hints, helper text                   |
| `link`        | 14 bold, `brand-text`          | Inline links                         |

Tones: `default`, `muted`, `brand`, `error`, `success`.

## Colour tokens

Defined once in `src/lib/colors.ts` (`lightColors` / `darkColors`), exposed to
NativeWind as CSS variables, and mapped to Tailwind names in
`tailwind.config.ts`. Use the class, not the hex.

| Group    | Tokens (Tailwind class suffix)                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Surfaces | `background`, `card`, `field`, `popover`, `secondary` (segmented track), `muted` (soft fill), `accent`, `pill` (selected segment)    |
| Text     | `foreground`, `muted-foreground`, `hint` (placeholders), `subtle` (chevrons), `neutral-text`, `brand-text`                           |
| Brand    | `primary`, `primary-foreground`, `tint`, `tint-border`, `tint-deep` (decor circles, logo fallback tile), `ring`                      |
| Lines    | `border`, `input`, `border-strong` (OTP, secondary controls), `control` (unchecked checkbox, toggle off), `divider` (rows in a card) |
| Status   | `destructive` (+`-tint`, `-text`, `-border`), `success` (+`-tint`, `-text`, `-border`), `warning` (+`-tint`, `-text`, `-border`)     |

Light values follow the Themes board and the vendor app boards: background
`#FBFAF8`, field `#FFFFFF`, ink `#1B130C`, muted text `#6B5E54`, border
`#E4DCD3`, track `#F1ECE6`, primary `#EB6C1A`, tint `#FFF1E7`, tint-border
`#F6D5BE`, tint-deep `#FFE2CF`, divider `#F0EAE3`. Dark (proposed on the Themes
board): background `#14100C`, field `#1E1812`, ink `#F7F2EC`, brand text
`#FF9B5A`, border `#3A3027`, brand fill unchanged.

### Contrast rules

- White on `primary` is **3.1:1**, which passes only for large text. Button
  labels are 19px bold for this reason — don't use white-on-orange for small text.
- Orange **text** on a light surface must use `brand-text` (`#B54A08`, 5.3:1),
  never `primary`. Error text uses `destructive-text`, success text
  `success-text`; the plain `destructive`/`success` colours are for borders and
  icons.

## Shape, size and elevation

| Thing         | Value                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| Field         | `h-field` 52px, `rounded-field` 14px, 1px `border`                                            |
| Button        | `min-h-button` 56px, `rounded-pill`, text 19px bold (white/soft/ghost 17px, `sm` 44px / 15px) |
| Card          | `rounded-card` 20px, 1px `border`, field shadow                                               |
| Icon tile     | `rounded-tile` 14px, 40px (list rows), 60px (product thumbs)                                  |
| Bottom sheet  | `rounded-t-sheet` 28px, 44x5 grabber, 22px title                                              |
| Status badge  | 24px tall, 10px padding, 12px bold, 1px border                                                |
| Toggle        | 48x28 track, 22px thumb inset 3px                                                             |
| Checkbox      | 24px, `rounded-checkbox` 8px, 1.5px border                                                    |
| Touch targets | at least 44px (`size="sm"` buttons, back button)                                              |

Shadows can't be theme variables on React Native, so they are constants in
`src/lib/colors.ts` (`SHADOWS.field`, `SHADOWS.button`, `SHADOWS.glow`) passed
via `style`. Also `SHADOWS.pill` (selected segment), `thumb`, `bar` (tab/action
bars), `sheet` and `toast` (floating notifications).

States: focus → 1.5px `primary` border; error → 1.5px `destructive-text` border +
`destructive-text` message (13px semibold); verified → green check inside the field; locked (`editable={false}`) →
`muted` fill, no shadow.

## Components (`src/components/ui`)

| Component                                           | Notes                                                                                                                                                 |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                            | variants `default` (orange, glow), `outline` (white + field shadow), `soft`, `secondary`, `ghost`, `destructive`; sizes `default`, `sm`, `lg`, `icon` |
| `Input`                                             | `label`, `hint`, `error`, `verified`, `startAdornment` (20px icon), `endAdornment`; `variant="auth"` is a deprecated alias of default                 |
| `Checkbox`                                          | orange fill, rounded tick, glow when checked                                                                                                          |
| `SegmentedControl`                                  | pill track, see below                                                                                                                                 |
| `Badge`                                             | variants `default`, `neutral`, `success`, `warning`, `destructive`, `outline`; 24px status pill                                                       |
| `Select`, `Card`, `Accordion`, `Avatar`, `Skeleton` | restyled to the same tokens                                                                                                                           |
| `ListRow`                                           | 64px row: 40px tint icon tile, 16/22 bold title, 13/18 muted subtitle, chevron                                                                        |
| `ScreenHeader`                                      | pushed: back + centred 21px title; root: 30px title + optional 15px subtitle                                                                          |
| `BottomSheet`                                       | white surface, 28px top radius, grabber, 22px title, 44px close button                                                                                |
| `Toggle`                                            | custom 48x28 switch (`accessibilityRole="switch"`)                                                                                                    |
| `Text`                                              | typography variants above                                                                                                                             |
| `OtpInput`                                          | N boxes driven by one hidden input (paste + autofill work)                                                                                            |
| `SocialButton`                                      | `provider="google" \| "apple"` white pill                                                                                                             |
| `Notice`                                            | inline banner: `info`, `success`, `warning`, `error`                                                                                                  |
| `ToastHost`                                         | the floating notification layer, mounted once per root layout; see "Notifications (toasts)"                                                           |
| `DividerLabel`                                      | "—— Or ——" separator                                                                                                                                  |
| `BackButton`                                        | 44px round white button                                                                                                                               |
| `StepProgress`                                      | "Step 2 of 3" segmented bar for wizards                                                                                                               |
| `HeroBadge`                                         | concentric tinted circles around an icon (status screens)                                                                                             |
| `StarRating`                                        | five stars: active filled brand orange, inactive outlined; `onChange` makes it tappable (rating form)                                                 |
| `Chip`                                              | outlined 40px filter pill (Home categories, Search filters, Deliveries status); selected = tint + brand border                                        |
| `QuantityStepper`                                   | round − / + around the count (Cart, Dish)                                                                                                             |
| `OptionCard`                                        | selectable card with an icon tile and a radio or tick (school, vehicle, food types)                                                                   |

### SegmentedControl (pill)

`SegmentedControl` (`options`, `value`, `onChange`, `className`, `scrollable`) is
the pill control from the boards (Login Email/Phone, Money tabs, Availability):
a 48px pill track (`secondary`) with 4px padding and gaps; the selected segment
is a white `pill` with `SHADOWS.pill` and a 15px bold label, the others 15px
semibold muted (14px when there are three or more options). Filter chips
(Orders status, 40px outlined pills) are a different pattern and are not
built from this component.

## Logo and ShopLogo

**Logo** (`src/components/logo.tsx`) is the Stuqet brand mark: a rounded-square
tile (radius 25% of the size) in `primary` with a white "s." glyph, drawn with
`react-native-svg` (the glyph is a path, no font needed), plus the "stuqet"
wordmark in Urbanist ExtraBold. The art is a placeholder (see the Logo board):
replace `GLYPH_PATH` / `LOGO_COLORS` when the real logo is supplied.

| Prop      | Values                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `size`    | `xs` (24px tile), `sm` (32), `default` (40), `lg` (56), `xl` (96)                                       |
| `variant` | `default` (tile + wordmark), `icon` (tile only)                                                         |
| `layout`  | `stacked` (default, tile above wordmark), `inline` (side by side)                                       |
| `vendor`  | VENDOR pill under/next to the wordmark; defaults to on in the vendor build (`EXPO_PUBLIC_ROUTE=vendor`) |
| `glow`    | orange glow under the tile (login, splash)                                                              |

The wordmark follows the theme (`foreground`) and the pill uses `tint` /
`tint-border` / `brand-text`, so dark mode needs no extra work (ink `#F7F2EC`,
pill text `#FF9B5A`). The tile stays orange in both themes. `LogoMark` renders
just the tile (`tile="brand" | "white" | "dark"`, any px size >= 24). Clear
space is half the tile width on every side.

**ShopLogo** (`src/components/shop-logo.tsx`) is the shop avatar used wherever a
shop or vendor is shown: `<ShopLogo uri? name size={24 | 40 | 56 | 72} />`. A
rounded square (radius 28% of the size) with the logo image, falling back to the
shop initials on a `tint-deep` tile (`tint-border` edge, `brand-text` initials)
while the image loads, if it fails, or when there is no URL. It is decorative
for screen readers by default (the name is almost always next to it); pass
`decorative={false}` for a stand-alone logo. Never use a generic store icon in
place of a shop's logo.

`AuthScreen` (`src/components/auth/auth-screen.tsx`) is the scaffold for every
unauthenticated screen: off-white background, two peach corner blobs, keyboard
avoidance, optional back button and pinned footer.

## Background

Every screen in both apps sits on the same off-white ground with two soft peach
circles in the top-right corner (`tint` 320px and `tint-deep` 160px) (`Backdrop`, `src/components/backdrop.tsx`). It
is drawn once by each app's root layout, and navigators and screens are
transparent (`Screen` is `bg-transparent`) so it shows through everywhere. Don't
give a screen root `bg-background`; cards, tab bars and action bars stay opaque.

## Content animation

Animation inside a screen lives in `src/components/ui/motion.tsx` and the
components that use it. It is only for what is on a screen: `HeroBadge` and
`StatusHero` pop in (success badges also send out a ripple and confetti),
`useCountUp` eases the sales total and balance up to their value, the Home chart
bars rise one after another, and `Button` gives a small press-down. Everything
respects the phone's "Reduce motion" setting.

How a screen loads and how screens navigate is not animated here; that belongs
to the navigation layer (stacks, tabs, splash) and must not be changed from
feature code. Do not add entrance animations to whole screens or list rows.

## Notifications (toasts)

Non-blocking, in-app messages. Show one with `notifySuccess`, `notifyError`,
`notifyInfo` or `notifyWarning` from `~/lib/utils/toast`, all
`({ message, description? })`. They work anywhere (components, mutation
callbacks, axios interceptors) because they write to a module-level Zustand
store (`src/lib/stores/toast-store.ts`); `ToastHost`
(`src/components/ui/toast.tsx`) renders it and is mounted once, last, in both
root layouts, so it draws above the navigators, the offline banner and the DEBUG
pill.

### Anatomy

Floating card pinned to the **top**, `safe-area top + 8px` down, 16px from each
side, stacked with an 8px gap.

| Part        | Spec                                                                                 |
| ----------- | ------------------------------------------------------------------------------------ |
| Surface     | `bg-card`, `rounded-2xl`, 1px `border-strong`, `SHADOWS.toast`                       |
| Accent      | 4px bar on the left edge: `success` / `destructive` / `primary` / `warning`          |
| Icon tile   | 40px `rounded-tile`, status tint fill, 22px icon in the matching `-text` colour      |
| Title       | `message`, Urbanist bold 15/20, max 2 lines (ellipsis)                               |
| Description | `description`, `meta` style (13/18 muted), max 2 lines                               |
| Dismiss     | 18px close glyph in a 44px target; the whole card is also tappable (min height 64px) |

Why the top: the bottom is where the tab bar, the pinned action bars and the
DEBUG pill live, and a toast there would cover the primary action of the screen
(Save, Withdraw, Submit). The top only covers the screen header, which is
never the thing the user is acting on, and it is dismissible with a swipe.

### Variants and timing

| Variant   | Icon                 | Accent / tint    | Use                                                | Stays up |
| --------- | -------------------- | ---------------- | -------------------------------------------------- | -------- |
| `success` | `checkmark-circle`   | success          | The thing the user just did worked                 | 3.5s     |
| `info`    | `information-circle` | primary / `tint` | Neutral news ("coming soon", "connection is back") | 3.5s     |
| `warning` | `warning`            | warning          | Works, but something needs attention               | 5s       |
| `error`   | `alert-circle`       | destructive      | It failed and the user can retry                   | 5s       |

A description adds 1.5s. Errors and warnings use an assertive live region,
the others polite; every toast has `accessibilityRole="alert"`, is announced on
iOS with `AccessibilityInfo.announceForAccessibility`, and exposes a `dismiss`
accessibility action.

### Behaviour

- **Auto-dismiss** after the time above. The timer **pauses while the card is
  touched or dragged** and resumes with the time left.
- **Dismiss** by tapping the card or the close glyph, or by swiping it up or
  sideways. Dragging down is resisted.
- **Stack:** newest on top, at most 3 visible (the oldest is dropped). Showing
  an identical toast (same variant, message and description) that is already on
  screen refreshes it in place instead of stacking a duplicate, so five failing
  queries show one "No connection".
- **Long text** never grows the card: titles and descriptions clamp to two
  lines, and the store caps the strings (140 / 280 characters) and collapses
  whitespace.
- **Motion:** the card slides down and fades in (260ms), leaves upward (180ms),
  and the others glide to their new place. All of it is off with "Reduce
  motion". It animates only the toast; it never touches how screens load or
  navigate.

### Toast, Alert or inline error?

| Situation                                                            | Use                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| Result of an action, nothing more to decide ("Payout details saved") | Toast (`notifySuccess`)                                |
| A request failed and the screen is still usable ("No connection")    | Toast (`notifyError`), or the screen's retry state     |
| A passing heads-up ("Google sign-in is coming soon")                 | Toast (`notifyInfo` / `notifyWarning`)                 |
| The user must choose (log out, reset data, discard changes)          | Native `Alert.alert` with buttons; never a toast       |
| A field is wrong, or the form cannot be submitted                    | Inline error under the field or a `Notice` in the form |
| State that must stay visible (account under review, session expired) | `Notice` / a status screen, not a toast                |

Keep copy short and human: the `message` is a headline ("No connection", "Order
accepted"), the optional `description` is what to do next. Don't put a toast and
an inline error on the same failure.

### Known limits

- Toasts are an ordinary view in the root layout, so a native `Modal` (the
  bottom sheet, the DEBUG inspector, the force-update modal) draws **over** them.
  Fire the toast after the sheet closes, or show the message inside the sheet.
- In development, React Native's own LogBox toast (white, bottom) and, in Expo
  Go, the floating gear button are separate native layers and are not part of
  this system.

## Appearance

The theme store holds a preference: `light`, `dark` or `system` ("Match my
phone", which follows the phone's setting live). The customer and rider
Appearance screen sets it; the vendor app keeps its light/dark switch.

## Customer and rider app

Shops are always shown with `ShopLogo` (Mama T Kitchen has a logo, Riverside
Grill shows its initials), ratings with `StarRating` or the single filled star
of `RatingLine`, and dishes with `FoodThumb` (picture on a peach tile with the
fork icon as fallback). Onboarding buttons sit directly on the page
(`SetupFooter`); ordering screens use the white `ActionBar`.

## Adding to the system

1. New colour → add the key to **both** `lightColors` and `darkColors`, then to
   `tailwind.config.ts`. Check contrast for any text use.
2. New component → `src/components/ui`, `cva` variants, tokens only, `Text`
   from the kit, minimum 44px touch target.
3. Per-app difference → only the brand accent, via `BRAND_COLORS` in
   `src/lib/colors.ts`.
