# Brand assets

Per-app artwork for the two Stuqet apps. Each app has its own folder:

- `customer/` — **Stuqet Customer** (customers and riders)
- `vendor/` — **Stuqet Vendor**

`app.config.ts` uses each file below only if it exists, so a build works before
the artwork is added (Expo's defaults are used until then). Add these to each
folder:

| File                                | Used for                         | Size      |
| ----------------------------------- | -------------------------------- | --------- |
| `app-icon-1024.png`                 | iOS and Android app icon         | 1024×1024 |
| `adaptive-icon-foreground-1024.png` | Android adaptive icon foreground | 1024×1024 |
| `splash-icon-1024.png`              | Splash screen mark               | 1024×1024 |
| `icon-32.png`                       | Web favicon                      | 32×32     |

Store listing graphics (feature graphic, screenshots) belong under
`assets/store/customer/` and `assets/store/vendor/`.
