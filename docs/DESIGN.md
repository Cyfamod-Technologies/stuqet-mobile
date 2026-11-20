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

| Variant   | Style                 | Use                    |
| --------- | --------------------- | ---------------------- |
| `display` | 32/38 extrabold       | Screen hero titles     |
| `title`   | 24/32 bold            | Section titles, OTP    |
| `heading` | 18/24 bold            | Card and list headings |
| `body`    | 16/24 regular         | Paragraphs             |
| `label`   | 14 semibold           | Field labels           |
| `caption` | 12/16 regular, muted  | Hints, helper text     |
| `link`    | 14 bold, `brand-text` | Inline links           |

Tones: `default`, `muted`, `brand`, `error`, `success`.

## Colour tokens

Defined once in `src/lib/colors.ts` (`lightColors` / `darkColors`), exposed to
NativeWind as CSS variables, and mapped to Tailwind names in
`tailwind.config.ts`. Use the class, not the hex.

| Group    | Tokens (Tailwind class suffix)                                                         |
| -------- | -------------------------------------------------------------------------------------- |
| Surfaces | `background`, `card`, `field`, `popover`, `secondary`, `muted`, `accent`               |
| Text     | `foreground`, `muted-foreground`, `hint`, `brand-text`                                 |
| Brand    | `primary`, `primary-foreground`, `tint`, `tint-border`, `ring`                         |
| Lines    | `border`, `input`                                                                      |
| Status   | `destructive` (+`-tint`, `-text`), `success` (+`-tint`, `-text`), `warning` (+`-tint`) |

Light values: background `#FBFAF8`, field `#FFFFFF`, border `#E7E2DA`, primary
`#EB6C1A`, tint `#FDF0E6`, destructive `#EF486A`, success `#1F9D61`.

### Contrast rules

- White on `primary` is **3.1:1**, which passes only for large text. Button
  labels are 19px bold for this reason — don't use white-on-orange for small text.
- Orange **text** on a light surface must use `brand-text` (`#B54A08`, 5.3:1),
  never `primary`. Error text uses `destructive-text`, success text
  `success-text`; the plain `destructive`/`success` colours are for borders and
  icons.

## Shape, size and elevation

| Thing         | Value                                               |
| ------------- | --------------------------------------------------- |
| Field         | `h-field` 52px, `rounded-field` 14px, 1px `border`  |
| Button        | `min-h-button` 56px, `rounded-pill`, text 19px bold |
| Checkbox      | 24px, `rounded-checkbox` 8px, 1.5px border          |
| Touch targets | at least 44px (`size="sm"` buttons, back button)    |

Shadows can't be theme variables on React Native, so they are constants in
`src/lib/colors.ts` (`SHADOWS.field`, `SHADOWS.button`, `SHADOWS.glow`) passed
via `style`.

States: focus → `primary` border; error → `destructive` border + `destructive-text`
message; verified → green check inside the field; locked (`editable={false}`) →
`muted` fill, no shadow.

## Components (`src/components/ui`)

| Component                                                                        | Notes                                                                                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Button`                                                                         | variants `default` (orange, glow), `outline`, `soft`, `secondary`, `ghost`, `destructive`; sizes `default`, `sm`, `lg`, `icon` |
| `Input`                                                                          | `label`, `hint`, `error`, `verified`, `endAdornment`; `variant="auth"` is a deprecated alias of default                        |
| `Checkbox`                                                                       | orange fill, rounded tick, glow when checked                                                                                   |
| `Select`, `SegmentedControl`, `Card`, `Badge`, `Accordion`, `Avatar`, `Skeleton` | restyled to the same tokens                                                                                                    |
| `Text`                                                                           | typography variants above                                                                                                      |
| `OtpInput`                                                                       | N boxes driven by one hidden input (paste + autofill work)                                                                     |
| `SocialButton`                                                                   | `provider="google" \| "apple"` white pill                                                                                      |
| `Notice`                                                                         | inline banner: `info`, `success`, `warning`, `error`                                                                           |
| `DividerLabel`                                                                   | "—— Or ——" separator                                                                                                           |
| `BackButton`                                                                     | 44px round white button                                                                                                        |
| `StepProgress`                                                                   | "Step 2 of 3" segmented bar for wizards                                                                                        |
| `HeroBadge`                                                                      | concentric tinted circles around an icon (status screens)                                                                      |

`AuthScreen` (`src/components/auth/auth-screen.tsx`) is the scaffold for every
unauthenticated screen: off-white background, two peach corner blobs, keyboard
avoidance, optional back button and pinned footer.

## Adding to the system

1. New colour → add the key to **both** `lightColors` and `darkColors`, then to
   `tailwind.config.ts`. Check contrast for any text use.
2. New component → `src/components/ui`, `cva` variants, tokens only, `Text`
   from the kit, minimum 44px touch target.
3. Per-app difference → only the brand accent, via `BRAND_COLORS` in
   `src/lib/colors.ts`.
