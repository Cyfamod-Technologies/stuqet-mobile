import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DemoFill } from "~/components/demo-fill";
import { Screen } from "~/components/screen";
import { SetupFooter } from "~/features/customer-onboarding/components/setup-footer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MediaPickerSheet } from "~/components/ui/media-picker-sheet";
import { Text } from "~/components/ui/text";
import { SetupHeader } from "~/features/customer-onboarding/components/setup-header";
import { useSchools } from "~/features/customer-account/hooks";
import { riderProfileSchema } from "~/features/rider-account/schemas";
import { useThemeColors } from "~/lib/colors";
import { OptionSheet, SelectRow } from "../components/option-sheet";
import { afterSheetCloses, pickForRider } from "../pick";
import { useRiderApplication } from "../store";

const AREAS = [
  "Hostels and campus",
  "Off-campus housing",
  "Whole school area",
  "Shops and markets nearby",
];

// Rider 1 · Profile: a photo, the phone number, the school and the area the
// rider covers. School and Area open list sheets; the photo opens the picker.
export function RiderProfileStepScreen() {
  const colors = useThemeColors();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const app = useRiderApplication();
  const [sheet, setSheet] = useState<"photo" | "school" | "area" | null>(null);
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false);
  const schools = useSchools(search.trim());

  const parsed = riderProfileSchema.safeParse({
    phone: app.phone,
    school: app.school,
    area: app.area,
  });
  const issues = parsed.success ? {} : parsed.error.flatten().fieldErrors;

  const pickPhoto = (source: "camera" | "library") =>
    afterSheetCloses(async () => {
      const file = await pickForRider(source);
      if (file) app.patch({ avatar: file });
    });

  const fill = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const demo = require("~/demo/customer") as typeof import("~/demo/customer");
    const photo = demo.pickDemoPhoto();
    app.patch({
      phone: demo.customerSamples.riderProfile[0].phone,
      school: "Riverside University",
      area: "Hostels and campus",
      avatar: { uri: photo.uri, name: photo.name },
    });
  };

  const next = () => {
    setTouched(true);
    if (parsed.success) router.push("/rider-setup/vehicle");
  };

  return (
    <View className="flex-1">
      <Screen
        contentContainerStyle={{ gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        <SetupHeader
          step={1}
          total={4}
          label="Your profile"
          onBack={() =>
            router.replace(
              from === "profile" ? "/(tabs)/profile" : "/(auth)/role",
            )
          }
        />
        <View className="gap-1.5">
          <Text
            accessibilityRole="header"
            className="font-sans-extrabold text-[32px] leading-[38px]"
          >
            Tell us about you
          </Text>
          <Text tone="muted" className="font-sans-medium text-base leading-6">
            Vendors and customers see this when you deliver.
          </Text>
        </View>

        <DemoFill
          onFill={
            process.env.EXPO_PUBLIC_DEMO_MODE === "true" ? fill : undefined
          }
        />

        <Pressable
          onPress={() => setSheet("photo")}
          accessibilityRole="button"
          accessibilityLabel="Add profile photo"
          className="flex-row items-center gap-4"
        >
          <View className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full border border-tint-border bg-tint-deep">
            {app.avatar ? (
              <Image
                source={{ uri: app.avatar.uri }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Ionicons
                name="camera-outline"
                size={26}
                color={colors["brand-text"]}
              />
            )}
          </View>
          <Text className="font-sans-bold text-[15px] text-brand-text underline">
            {app.avatar ? "Change profile photo" : "Add profile photo"}
          </Text>
        </Pressable>

        <Input
          label="Phone number"
          value={app.phone}
          onChangeText={(phone) => app.patch({ phone })}
          keyboardType="phone-pad"
          placeholder="0801 234 5678"
          error={touched ? issues.phone?.[0] : undefined}
          startAdornment={
            <Ionicons name="call-outline" size={20} color={colors.hint} />
          }
        />
        <SelectRow
          label="School you deliver at"
          value={app.school}
          placeholder="Choose your school"
          icon="school-outline"
          error={touched ? issues.school?.[0] : undefined}
          onPress={() => setSheet("school")}
        />
        <SelectRow
          label="Area you cover"
          value={app.area}
          placeholder="Choose an area"
          icon="location-outline"
          error={touched ? issues.area?.[0] : undefined}
          onPress={() => setSheet("area")}
        />
      </Screen>
      <SetupFooter>
        <Button onPress={next}>Continue</Button>
      </SetupFooter>

      <MediaPickerSheet
        visible={sheet === "photo"}
        onClose={() => setSheet(null)}
        title="Add a profile photo"
        onTakePhoto={() => pickPhoto("camera")}
        onChooseLibrary={() => pickPhoto("library")}
      />
      <OptionSheet
        visible={sheet === "school"}
        onClose={() => setSheet(null)}
        title="School you deliver at"
        options={(schools.data ?? []).map((s) => s.name)}
        loading={schools.isLoading}
        selected={app.school}
        searchable
        onSearch={setSearch}
        onSelect={(school) => app.patch({ school })}
      />
      <OptionSheet
        visible={sheet === "area"}
        onClose={() => setSheet(null)}
        title="Area you cover"
        subtitle="Where you will take deliveries."
        options={AREAS}
        selected={app.area}
        onSelect={(area) => app.patch({ area })}
      />
    </View>
  );
}
