import { Linking, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionBar } from "~/components/ui/action-bar";
import { BackButton } from "~/components/ui/back-button";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { SUPPORT_EMAIL } from "~/features/auth/constants";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { VEHICLES, vehicleTitle } from "../constants";
import { useRiderProfile } from "../hooks";
import type { DocumentState } from "../types";

const STATE_BADGE: Record<
  DocumentState,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  approved: { label: "Approved", variant: "success" },
  pending: { label: "In review", variant: "warning" },
  rejected: { label: "Rejected", variant: "destructive" },
  missing: { label: "Missing", variant: "neutral" },
};

// Vehicle and documents board: the vehicle in a highlighted card, the three
// documents with their review status, and "Contact support" (changes are
// reviewed before they apply, so they are not edited here).
export function RiderVehicleScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const profile = useRiderProfile();
  const data = profile.data;
  const icon =
    VEHICLES.find((v) => v.kind === data?.vehicle)?.icon ?? "bicycle";

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-transparent"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 24,
          paddingHorizontal: 20,
          gap: 14,
        }}
      >
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text
            variant="headerTitle"
            numberOfLines={1}
            className="flex-1 text-center"
          >
            Vehicle and documents
          </Text>
          <View className="w-11" />
        </View>
        {profile.isLoading ? (
          <Skeleton className="h-48 rounded-card" />
        ) : profile.isError || !data ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load your details"
            actionLabel="Try again"
            onAction={() => void profile.refetch()}
          />
        ) : (
          <>
            <View className="min-h-16 flex-row items-center gap-3.5 rounded-card border-[1.5px] border-primary bg-tint px-4 py-3">
              <View className="h-10 w-10 items-center justify-center rounded-tile bg-primary">
                <Ionicons
                  name={icon}
                  size={20}
                  color={colors["primary-foreground"]}
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text variant="heading" className="text-base leading-[22px]">
                  {vehicleTitle(data.vehicle)}
                </Text>
                {data.plate ? (
                  <Text variant="meta">{`Plate ${data.plate}`}</Text>
                ) : null}
              </View>
            </View>
            <Text variant="heading" className="text-[19px]">
              Documents
            </Text>
            <Card className="overflow-hidden p-0">
              {data.documents.map((doc, index) => (
                <View
                  key={doc.key}
                  className={cn(
                    "min-h-16 flex-row items-center gap-3 px-4 py-2.5",
                    index < data.documents.length - 1 &&
                      "border-b border-divider",
                  )}
                >
                  <View className="h-10 w-10 items-center justify-center rounded-tile bg-tint">
                    <Ionicons
                      name="id-card-outline"
                      size={20}
                      color={colors["brand-text"]}
                    />
                  </View>
                  <Text className="min-w-0 flex-1 font-sans-bold text-[15px]">
                    {doc.label}
                  </Text>
                  <Badge
                    label={STATE_BADGE[doc.state].label}
                    variant={STATE_BADGE[doc.state].variant}
                  />
                </View>
              ))}
            </Card>
            <Text variant="meta" className="text-[13px]">
              To change your vehicle or documents, contact support. Changes are
              reviewed before they apply.
            </Text>
          </>
        )}
      </ScrollView>
      <ActionBar>
        <Button
          variant="outline"
          onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
        >
          Contact support
        </Button>
      </ActionBar>
    </View>
  );
}
