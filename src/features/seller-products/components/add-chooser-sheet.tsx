import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Text } from "~/components/ui/text";
import type { ListingType } from "../types";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const CHOICES: {
  type: ListingType;
  icon: IoniconName;
  title: string;
  description: string;
  channel: string;
}[] = [
  {
    type: "product",
    icon: "cube-outline",
    title: "Product",
    description: "Goods like electronics, clothes and accessories.",
    channel: "Sold on the Stuqet website",
  },
  {
    type: "food",
    icon: "restaurant-outline",
    title: "Food item",
    description: "Meals and drinks with prep time and availability.",
    channel: "Sold in the Stuqet customer app",
  },
];

interface AddChooserSheetProps {
  visible: boolean;
  onClose: () => void;
  onChoose: (type: ListingType) => void;
}

// "What do you want to add?" Always shown: the API does not tell us the shop
// type, and one shop can sell both.
export function AddChooserSheet({
  visible,
  onClose,
  onChoose,
}: AddChooserSheetProps) {
  const colors = useThemeColors();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="What do you want to add?"
      subtitle="Pick one to open the right form."
    >
      <View className="gap-3.5">
        {CHOICES.map((choice) => (
          <Pressable
            key={choice.type}
            onPress={() => onChoose(choice.type)}
            accessibilityRole="button"
            accessibilityLabel={`${choice.title}. ${choice.description} ${choice.channel}`}
            style={SHADOWS.field}
            className="flex-row items-center gap-3.5 rounded-[20px] border border-border bg-card p-4 active:opacity-90"
          >
            <View className="h-14 w-14 items-center justify-center rounded-[18px] border border-tint-border bg-tint">
              <Ionicons
                name={choice.icon}
                size={26}
                color={colors["brand-text"]}
              />
            </View>
            <View className="flex-1 gap-0.5">
              <Text
                variant="heading"
                className="font-sans-extrabold text-[19px]"
              >
                {choice.title}
              </Text>
              <Text
                tone="muted"
                className="font-sans-medium text-sm leading-[19px]"
              >
                {choice.description}
              </Text>
              <Text className="font-sans-bold text-xs text-brand-text">
                {choice.channel}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.hint} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}
