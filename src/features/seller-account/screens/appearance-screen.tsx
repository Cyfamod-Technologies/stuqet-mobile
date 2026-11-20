import { Card } from "~/components/ui/card";
import { ListRow } from "~/components/ui/list-row";
import { Notice } from "~/components/ui/notice";
import { Toggle } from "~/components/ui/toggle";
import { Screen } from "~/components/screen";
import { ScreenHeader } from "~/components/ui/screen-header";
import { isThemeSwitchEnabled } from "~/lib/config/features";
import { useThemeStore } from "~/lib/stores/theme-store";

// "Settings" screen: appearance only for now (profile data lives in Shop
// settings, sign-out in More).
export function AppearanceScreen() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <Screen>
      <ScreenHeader title="Appearance" back />

      {isThemeSwitchEnabled ? (
        <Card className="overflow-hidden p-0">
          <ListRow
            icon={theme === "dark" ? "moon-outline" : "sunny-outline"}
            title="Dark mode"
            subtitle="Easier on the eyes at night"
            right={
              <Toggle
                label="Dark mode"
                value={theme === "dark"}
                onValueChange={(on) => setTheme(on ? "dark" : "light")}
              />
            }
            last
          />
        </Card>
      ) : (
        <Notice tone="info">
          The theme is fixed in this version of the app.
        </Notice>
      )}
    </Screen>
  );
}
