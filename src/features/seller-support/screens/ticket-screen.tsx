import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DemoFill } from "~/components/demo-fill";
import { BackButton } from "~/components/ui/back-button";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/ui/empty-state";
import { MediaPickerSheet } from "~/components/ui/media-picker-sheet";
import { RoundIconButton } from "~/components/ui/round-icon-button";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { PhotoChip } from "../components/photo-chip";
import { TicketBubble } from "../components/ticket-bubble";
import { MAX_MESSAGE_LENGTH } from "../constants";
import { useReplyToTicket, useTicket } from "../hooks";
import { usePhotoAttachment } from "../use-photo-attachment";
import { STATUS_BADGE, STATUS_LABEL, toStatus } from "../utils";
import { SupportGate } from "../components/support-gate";

// A ticket thread: the status, the messages (oldest first) and a reply bar
// with photo attach. Needs the TODO(backend) endpoints (see api.ts).
function TicketThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ticketId = Number(id);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const ticket = useTicket(ticketId);
  const reply = useReplyToTicket();
  const attachment = usePhotoAttachment();
  const listRef = useRef<FlatList>(null);
  const [text, setText] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const status = ticket.data ? toStatus(ticket.data.status) : null;
  const canSend =
    (text.trim().length > 0 || attachment.photo !== null) &&
    !reply.isPending &&
    !attachment.uploading;

  const send = () => {
    if (!canSend) return;
    reply.mutate(
      {
        ticketId,
        reply: text.trim(),
        attachments: attachment.photo?.uploadId ?? null,
      },
      {
        onSuccess: () => {
          setText("");
          attachment.remove();
        },
      },
    );
  };

  const header = (
    <View
      className="gap-3.5 px-5 pb-3.5"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center gap-3">
        <BackButton />
        <Text
          variant="heading"
          className="min-w-0 flex-1 text-center text-[21px]"
          numberOfLines={1}
        >
          {ticket.data?.subject ?? "Ticket"}
        </Text>
        <View className="w-11" />
      </View>
      {status ? (
        <View className="items-center">
          <Badge label={STATUS_LABEL[status]} variant={STATUS_BADGE[status]} />
        </View>
      ) : null}
    </View>
  );

  if (ticket.isPending || ticket.isError) {
    return (
      <View className="flex-1">
        {header}
        {ticket.isPending ? (
          <View className="gap-3.5 px-5">
            <Skeleton className="h-16 w-3/4 self-end rounded-[20px]" />
            <Skeleton className="h-16 w-3/4 rounded-[20px]" />
          </View>
        ) : (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load this ticket"
            message="Check your connection and try again."
            actionLabel="Try again"
            onAction={() => ticket.refetch()}
          />
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={listRef}
        data={ticket.data.messages}
        keyExtractor={(message) => String(message.id)}
        renderItem={({ item }) => <TicketBubble message={item} />}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{ marginHorizontal: -20 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 14,
          paddingBottom: 16,
        }}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
        refreshControl={
          <RefreshControl
            refreshing={ticket.isRefetching}
            onRefresh={() => {
              void ticket.refetch();
            }}
            tintColor={colors.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      />

      <View
        className="gap-2 border-t border-border bg-card px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
      >
        <DemoFill
          label="Fill sample reply"
          onFill={
            process.env.EXPO_PUBLIC_DEMO_MODE === "true"
              ? () => {
                  const samples =
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    require("~/demo/samples") as typeof import("~/demo/samples");
                  setText(samples.replySample());
                }
              : undefined
          }
        />
        {attachment.photo ? (
          <View className="flex-row pt-2">
            <PhotoChip
              uri={attachment.photo.uri}
              onRemove={attachment.remove}
              size={64}
            />
          </View>
        ) : null}
        <View className="flex-row items-center gap-2.5">
          <RoundIconButton
            icon="attach-outline"
            label="Attach photo"
            onPress={() => setSheetOpen(true)}
          />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type your reply"
            placeholderTextColor={colors.hint}
            accessibilityLabel="Reply"
            maxLength={MAX_MESSAGE_LENGTH}
            multiline
            className="max-h-28 min-h-12 min-w-0 flex-1 rounded-pill border border-border bg-field px-[18px] py-3 font-sans-medium text-base text-foreground"
          />
          <Pressable
            onPress={send}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send reply"
            className="h-12 w-12 items-center justify-center rounded-full bg-primary active:opacity-90 disabled:opacity-50"
          >
            {reply.isPending ? (
              <ActivityIndicator
                size="small"
                color={colors["primary-foreground"]}
              />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={colors["primary-foreground"]}
              />
            )}
          </Pressable>
        </View>
      </View>

      <MediaPickerSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add a photo"
        onTakePhoto={() => attachment.attach("camera")}
        onChooseLibrary={() => attachment.attach("library")}
      />
    </KeyboardAvoidingView>
  );
}

export function TicketScreen() {
  return (
    <SupportGate>
      <TicketThread />
    </SupportGate>
  );
}
