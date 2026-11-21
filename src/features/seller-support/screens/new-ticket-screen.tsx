import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { MediaPickerSheet } from "~/components/ui/media-picker-sheet";
import { Text } from "~/components/ui/text";
import { FormField } from "~/components/forms/form-field";
import { FormScreen } from "~/features/seller-account/components/form-screen";
import { useThemeColors } from "~/lib/colors";
import { PhotoChip } from "../components/photo-chip";
import { MAX_MESSAGE_LENGTH, MAX_SUBJECT_LENGTH } from "../constants";
import { useCreateTicket } from "../hooks";
import { ticketSchema, type TicketValues } from "../schemas";
import { usePhotoAttachment } from "../use-photo-attachment";
import { SupportGate } from "../components/support-gate";

// "Create a ticket": subject, details and an optional photo.
function NewTicketForm() {
  const router = useRouter();
  const colors = useThemeColors();
  const create = useCreateTicket();
  const attachment = usePhotoAttachment();
  const [sheetOpen, setSheetOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<TicketValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: "", details: "" },
  });

  const fill =
    process.env.EXPO_PUBLIC_DEMO_MODE === "true"
      ? () => {
          const samples =
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            require("~/demo/samples") as typeof import("~/demo/samples");
          reset(samples.ticketSample());
        }
      : undefined;

  const onSubmit = handleSubmit((values) => {
    create.mutate(
      {
        subject: values.subject,
        details: values.details,
        attachments: attachment.photo?.uploadId ?? null,
      },
      {
        onSuccess: ({ code }) =>
          router.replace({
            pathname: "/(tabs)/more/support/sent",
            params: { code },
          }),
      },
    );
  });

  return (
    <FormScreen
      title="Create a ticket"
      demoFill={fill}
      footer={
        <Button
          onPress={onSubmit}
          loading={create.isPending}
          disabled={attachment.uploading}
        >
          Submit ticket
        </Button>
      }
    >
      <FormField
        control={control}
        name="subject"
        label="Subject"
        placeholder="e.g. Payout not received"
        maxLength={MAX_SUBJECT_LENGTH}
      />
      <FormField
        control={control}
        name="details"
        label="Details"
        placeholder="Tell us what happened"
        multiline
        textAlignVertical="top"
        className="min-h-[72px]"
        maxLength={MAX_MESSAGE_LENGTH}
      />

      <View className="gap-2">
        <Text variant="label">Photo (optional)</Text>
        <View className="flex-row">
          {attachment.photo ? (
            <PhotoChip
              uri={attachment.photo.uri}
              onRemove={attachment.remove}
            />
          ) : (
            <Pressable
              onPress={() => setSheetOpen(true)}
              disabled={attachment.uploading}
              accessibilityRole="button"
              accessibilityLabel="Add photo"
              className="h-[88px] w-[88px] items-center justify-center gap-0.5 rounded-[18px] border-[1.5px] border-dashed border-tint-border bg-tint active:opacity-80"
            >
              <Ionicons
                name="camera-outline"
                size={22}
                color={colors["brand-text"]}
              />
              <Text className="font-sans-bold text-xs text-brand-text">
                {attachment.uploading ? "Uploading…" : "Add photo"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <MediaPickerSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add a photo"
        onTakePhoto={() => attachment.attach("camera")}
        onChooseLibrary={() => attachment.attach("library")}
      />
    </FormScreen>
  );
}

export function NewTicketScreen() {
  return (
    <SupportGate>
      <NewTicketForm />
    </SupportGate>
  );
}
