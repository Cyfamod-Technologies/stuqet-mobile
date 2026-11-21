import { useRef, useState, type ComponentRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DemoFill } from "~/components/demo-fill";
import { ShopLogo } from "~/components/shop-logo";
import { BackButton } from "~/components/ui/back-button";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { formatClock } from "~/lib/utils/format";
import { useChat, useSendMessage } from "../hooks";

// Chat with the vendor about an order: header with the logo and name, the
// conversation (mine in peach on the right, theirs in white on the left with
// the vendor logo and a "Vendor · 12:43" line) and the message field. The
// vendor answers a few seconds after you write.
export function ChatScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const chat = useChat(orderId);
  const send = useSendMessage(orderId);
  const [text, setText] = useState("");
  const [sample, setSample] = useState(0);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const thread = chat.data;

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    send.mutate(value);
    setText("");
  };

  const fill = () => {
    const { customerSamples } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("~/demo/customer") as typeof import("~/demo/customer");
    setText(customerSamples.chat[sample % customerSamples.chat.length]);
    setSample((n) => n + 1);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        className="flex-row items-center gap-3 px-5 pb-2"
        style={{ paddingTop: insets.top + 12 }}
      >
        <BackButton />
        {thread ? (
          <ShopLogo
            uri={thread.vendor.logo}
            name={thread.vendor.name}
            size={40}
          />
        ) : null}
        <Text
          variant="headerTitle"
          numberOfLines={1}
          className="flex-1 text-left"
        >
          {thread?.vendor.name ?? ""}
        </Text>
      </View>

      <ScrollView
        ref={scroll}
        className="flex-1 bg-transparent"
        contentContainerStyle={{ padding: 20, gap: 14, flexGrow: 1 }}
        onContentSizeChange={() =>
          scroll.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled"
      >
        {chat.isLoading ? (
          <>
            <Skeleton className="h-14 w-3/4 self-end rounded-2xl" />
            <Skeleton className="h-14 w-2/3 rounded-2xl" />
          </>
        ) : chat.isError || !thread ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load the chat"
            actionLabel="Try again"
            onAction={() => void chat.refetch()}
          />
        ) : thread.messages.length === 0 ? (
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="Say hello"
            message={`Ask ${thread.vendor.name} anything about order #${thread.orderCode}.`}
          />
        ) : (
          thread.messages.map((message) => (
            <View
              key={message.id}
              className={cn(
                "max-w-[82%] gap-1",
                message.mine ? "items-end self-end" : "items-start self-start",
              )}
            >
              <View
                className={cn(
                  "rounded-[18px] px-3.5 py-2.5",
                  message.mine
                    ? "rounded-br-md border border-tint-border bg-tint"
                    : "rounded-bl-md border border-border bg-card",
                )}
              >
                <Text className="font-sans-medium text-[15px] leading-[21px]">
                  {message.text}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                {!message.mine && thread ? (
                  <ShopLogo
                    uri={thread.vendor.logo}
                    name={thread.vendor.name}
                    size={24}
                  />
                ) : null}
                <Text variant="caption" className="text-[11px]">
                  {message.mine
                    ? formatClock(message.createdAt)
                    : `${thread?.vendor.name} · ${formatClock(message.createdAt)}`}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View
        className="gap-2 border-t border-border bg-card px-5 pt-3"
        style={[
          SHADOWS.bar,
          { paddingBottom: Math.max(insets.bottom, 12) + 4 },
        ]}
      >
        <DemoFill
          onFill={
            process.env.EXPO_PUBLIC_DEMO_MODE === "true" ? fill : undefined
          }
          label="Fill a message"
        />
        <View className="flex-row items-center gap-2.5">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message"
            placeholderTextColor={colors.hint}
            returnKeyType="send"
            onSubmitEditing={submit}
            style={{ fontSize: 16 }}
            className="h-11 flex-1 rounded-full border border-border bg-field px-4 font-sans-medium text-foreground"
          />
          <Pressable
            onPress={submit}
            accessibilityRole="button"
            accessibilityLabel="Send"
            disabled={!text.trim()}
            style={SHADOWS.button}
            className={cn(
              "h-11 w-11 items-center justify-center rounded-full bg-primary",
              !text.trim() && "opacity-50",
            )}
          >
            <Ionicons
              name="paper-plane"
              size={18}
              color={colors["primary-foreground"]}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
