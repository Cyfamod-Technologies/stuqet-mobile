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
bars) and `sheet`.

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
| `DividerLabel`                                      | "—— Or ——" separator                                                                                                                                  |
| `BackButton`                                        | 44px round white button                                                                                                                               |
| `StepProgress`                                      | "Step 2 of 3" segmented bar for wizards                                                                                                               |
| `HeroBadge`                                         | concentric tinted circles around an icon (status screens)                                                                                             |

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

## Adding to the system

1. New colour → add the key to **both** `lightColors` and `darkColors`, then to
   `tailwind.config.ts`. Check contrast for any text use.
2. New component → `src/components/ui`, `cva` variants, tokens only, `Text`
   from the kit, minimum 44px touch target.
3. Per-app difference → only the brand accent, via `BRAND_COLORS` in
   `src/lib/colors.ts`.
