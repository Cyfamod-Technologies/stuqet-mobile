import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MediaPickerSheet } from "~/components/ui/media-picker-sheet";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import {
  afterSheetCloses,
  pickDocument,
  pickImage,
  takePhoto,
} from "../pick-image";
import type { PickedFile, PickedImage } from "../types";

interface FileFieldProps {
  label: string;
  value: PickedFile | null;
  error?: string;
  onChange: (file: PickedFile) => void;
}

function fromImage(image: PickedImage): PickedFile {
  return { uri: image.uri, name: image.name, mimeType: image.mimeType };
}

// Dashed upload tile from the Verification design. Tapping it opens the
// "Upload a document" sheet: take a photo, choose from the library, or choose
// a file (JPG, PNG or PDF).
export function FileField({ label, value, error, onChange }: FileFieldProps) {
  const colors = useThemeColors();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handle = (pick: () => Promise<PickedFile | PickedImage | null>) => () =>
    afterSheetCloses(() => {
      void pick().then((result) => {
        if (!result) return;
        onChange("base64" in result ? fromImage(result) : result);
      });
    });

  return (
    <View className="gap-1.5">
      <Pressable
        onPress={() => setSheetOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={
          value ? `${label}: ${value.name}. Change file` : `Upload ${label}`
        }
        className={cn(
          "min-h-[76px] flex-row items-center gap-3.5 rounded-[18px] border-[1.5px] border-dashed bg-tint px-4 py-3 active:opacity-80",
          error ? "border-destructive" : "border-tint-border",
        )}
      >
        <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-card">
          <Ionicons
            name={value ? "checkmark-circle" : "cloud-upload-outline"}
            size={22}
            color={value ? colors.success : colors["brand-text"]}
          />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="heading" className="text-[15px]" numberOfLines={2}>
            {label}
          </Text>
          <Text
            variant="caption"
            className="font-sans-medium text-[13px]"
            numberOfLines={1}
          >
            {value ? `${value.name} · Tap to change` : "JPG, PNG or PDF"}
          </Text>
        </View>
      </Pressable>
      {error ? (
        <Text variant="caption" tone="error" className="font-sans-medium">
          {error}
        </Text>
      ) : null}

      <MediaPickerSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Upload a document"
        onTakePhoto={handle(() => takePhoto())}
        onChooseLibrary={handle(() => pickImage())}
        onChooseFile={handle(pickDocument)}
      />
    </View>
  );
}
