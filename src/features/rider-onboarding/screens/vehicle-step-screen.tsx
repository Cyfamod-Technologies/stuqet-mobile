import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DemoFill } from "~/components/demo-fill";
import { Screen } from "~/components/screen";
import { SetupFooter } from "~/features/customer-onboarding/components/setup-footer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { OptionCard } from "~/components/ui/option-card";
import { Text } from "~/components/ui/text";
import { SetupHeader } from "~/features/customer-onboarding/components/setup-header";
import { VEHICLES } from "~/features/rider-account/constants";
import { PLATE_REGEX } from "~/features/rider-account/schemas";
import { useThemeColors } from "~/lib/colors";
import { useRiderApplication } from "../store";

// Rider 2 · Vehicle: Motorbike, Bicycle or On foot, plus the plate number for
// a motorbike.
export function RiderVehicleStepScreen() {
  const colors = useThemeColors();
  const app = useRiderApplication();
  const [touched, setTouched] = useState(false);
  const needsPlate = app.vehicle === "motorbike";
  const plateError =
    needsPlate && !PLATE_REGEX.test(app.plate.trim())
      ? "Enter the plate number of your motorbike"
      : undefined;

  const fill = () => {
    const { customerSamples } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("~/demo/customer") as typeof import("~/demo/customer");
    app.patch({ vehicle: "motorbike", plate: customerSamples.plates[0] });
  };

  return (
    <View className="flex-1">
      <Screen
        contentContainerStyle={{ gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        <SetupHeader step={2} total={4} label="Your vehicle" />
        <View className="gap-1.5">
          <Text
            accessibilityRole="header"
            className="font-sans-extrabold text-[32px] leading-[38px]"
          >
            How will you deliver?
          </Text>
          <Text tone="muted" className="font-sans-medium text-base leading-6">
            Pick the way you will get around.
          </Text>
        </View>
        <DemoFill
          onFill={
            process.env.EXPO_PUBLIC_DEMO_MODE === "true" ? fill : undefined
          }
        />
        <View className="gap-3">
          {VEHICLES.map((vehicle) => (
            <OptionCard
              key={vehicle.kind}
              icon={vehicle.icon}
              title={vehicle.title}
              subtitle={vehicle.subtitle}
              selected={app.vehicle === vehicle.kind}
              onPress={() => app.patch({ vehicle: vehicle.kind })}
            />
          ))}
        </View>
        {needsPlate ? (
          <Input
            label="Plate number"
            value={app.plate}
            onChangeText={(plate) => app.patch({ plate: plate.toUpperCase() })}
            placeholder="e.g. ABC 123 XY"
            autoCapitalize="characters"
            error={touched ? plateError : undefined}
            startAdornment={
              <Ionicons name="card-outline" size={20} color={colors.hint} />
            }
          />
        ) : null}
      </Screen>
      <SetupFooter>
        <Button
          onPress={() => {
            setTouched(true);
            if (!plateError) router.push("/rider-setup/documents");
          }}
        >
          Continue
        </Button>
      </SetupFooter>
    </View>
  );
}
