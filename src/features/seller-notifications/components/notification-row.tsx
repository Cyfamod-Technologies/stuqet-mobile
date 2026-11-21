import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import type { SellerNotification } from "../types";
import { shortTimeAgo } from "../utils";

interface NotificationRowProps {
  notification: SellerNotification;
  last: boolean;
  onPress: (notification: SellerNotification) => void;
}

export function NotificationRow({
  notification,
  last,
  onPress,
}: NotificationRowProps) {
  const colors = useThemeColors();
  const { unread } = notification;
  const time = shortTimeAgo(notification.createdAt);

  return (
    <Pressable
      onPress={() => onPress(notification)}
      accessibilityRole="button"
      accessibilityLabel={`${unread ? "Unread. " : ""}${notification.title}. ${notification.message}. ${time}`}
      className={cn(
        "min-h-[68px] flex-row items-center gap-3 px-4 py-3 active:bg-muted",
        !last && "border-b border-border",
      )}
    >
      {/* The unread dot sits on the icon tile's corner, so read rows keep no
          empty column on the left. */}
      <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-tint">
        <Ionicons
          name={notification.icon}
          size={20}
          color={colors["brand-text"]}
        />
        {unread ? (
          <View
            accessibilityElementsHidden
            className="absolute -left-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-primary"
          />
        ) : null}
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          className={cn(
            "text-[15px] leading-5",
            unread ? "font-sans-extrabold" : "font-sans-semibold",
          )}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text variant="caption" className="text-[13px]" numberOfLines={2}>
          {notification.message}
        </Text>
      </View>
      {time ? (
        <Text variant="caption" className="mt-1 self-start font-sans-semibold">
          {time}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function NotificationRowSkeleton({ last }: { last: boolean }) {
  return (
    <View
      className={cn(
        "min-h-[68px] flex-row items-center gap-3 px-4 py-3",
        !last && "border-b border-border",
      )}
    >
      <Skeleton className="h-10 w-10 rounded-[14px]" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-3 w-56" />
      </View>
    </View>
  );
}
