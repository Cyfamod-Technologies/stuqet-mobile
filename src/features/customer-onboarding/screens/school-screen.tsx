import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "~/components/screen";
import { SetupFooter } from "~/features/customer-onboarding/components/setup-footer";
import { BackButton } from "~/components/ui/back-button";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { OptionCard } from "~/components/ui/option-card";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import {
  useProfile,
  useSaveProfile,
  useSchools,
} from "~/features/customer-account/hooks";
import { useThemeColors } from "~/lib/colors";
import { SetupHeader } from "../components/setup-header";

// Set up 1 · School. Also opened from the Home school pill (`?change=1`) to
// switch school, where it is a plain list with Save and no step bar.
export function SchoolScreen() {
  const colors = useThemeColors();
  const { change } = useLocalSearchParams<{ change?: string }>();
  const segments: string[] = useSegments();
  const changing = change === "1" || segments[0] === "(tabs)";
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  const schools = useSchools(search.trim());
  const profile = useProfile();
  const save = useSaveProfile();
  const selected = picked ?? profile.data?.school ?? null;

  const next = () => router.push("/setup/interests");
  const submit = () => {
    if (!selected) return;
    save.mutate(
      { school: selected },
      { onSuccess: () => (changing ? router.back() : next()) },
    );
  };

  return (
    <View className="flex-1">
      <Screen contentContainerStyle={{ gap: 14 }}>
        {changing ? (
          <BackButton />
        ) : (
          <SetupHeader
            step={1}
            total={4}
            label="School"
            onSkip={next}
            onBack={() => router.replace("/(auth)/role")}
          />
        )}
        <View className="gap-1.5">
          <Text
            accessibilityRole="header"
            className="font-sans-extrabold text-[32px] leading-[38px]"
          >
            Which school are you at?
          </Text>
          <Text tone="muted" className="font-sans-medium text-base leading-6">
            We&apos;ll show food vendors that deliver to your school.
          </Text>
        </View>

        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search schools"
          autoCorrect={false}
          startAdornment={
            <Ionicons name="search" size={20} color={colors.hint} />
          }
        />

        <View className="gap-3">
          {schools.isLoading ? (
            <>
              <Skeleton className="h-16 rounded-card" />
              <Skeleton className="h-16 rounded-card" />
              <Skeleton className="h-16 rounded-card" />
            </>
          ) : schools.isError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Couldn't load schools"
              message="Check your connection and try again."
              actionLabel="Try again"
              onAction={() => void schools.refetch()}
            />
          ) : schools.data && schools.data.length === 0 ? (
            <EmptyState
              icon="school-outline"
              title="No school found"
              message="Try a different name."
            />
          ) : (
            schools.data?.map((school) => (
              <OptionCard
                key={school.id}
                icon="school-outline"
                title={school.name}
                selected={selected === school.name}
                onPress={() => setPicked(school.name)}
              />
            ))
          )}
        </View>
      </Screen>
      <SetupFooter>
        <Button disabled={!selected} loading={save.isPending} onPress={submit}>
          {changing ? "Save" : "Continue"}
        </Button>
      </SetupFooter>
    </View>
  );
}
