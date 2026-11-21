import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DemoFill } from "~/components/demo-fill";
import { Screen } from "~/components/screen";
import { SetupFooter } from "~/features/customer-onboarding/components/setup-footer";
import { Button } from "~/components/ui/button";
import { MediaPickerSheet } from "~/components/ui/media-picker-sheet";
import { Text } from "~/components/ui/text";
import { SetupHeader } from "~/features/customer-onboarding/components/setup-header";
import type { DocumentKey } from "~/features/rider-account/types";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { afterSheetCloses, pickForRider } from "../pick";
import { useRiderApplication } from "../store";

const DOCS: {
  key: DocumentKey;
  title: string;
  hint: string;
  motorbikeOnly?: boolean;
}[] = [
  {
    key: "government_id",
    title: "Government ID",
    hint: "Clear photo of the front, JPG or PNG",
  },
  {
    key: "drivers_licence",
    title: "Driver's licence",
    hint: "Needed for motorbike riders",
    motorbikeOnly: true,
  },
  {
    key: "id_photo",
    title: "Photo of you holding your ID",
    hint: "Helps us confirm it is you",
  },
];

// Rider 3 · Documents: three upload rows. A row is a dashed orange card until a
// file is picked, then a green "uploaded" card. The licence is only required
// for motorbike riders.
export function RiderDocumentsStepScreen() {
  const colors = useThemeColors();
  const app = useRiderApplication();
  const [picking, setPicking] = useState<DocumentKey | null>(null);
  const docs = DOCS.filter(
    (d) => !d.motorbikeOnly || app.vehicle === "motorbike",
  );
  const complete = docs.every((d) => app.documents[d.key]);

  const pick = (source: "camera" | "library" | "file") => {
    const key = picking;
    if (!key) return;
    afterSheetCloses(async () => {
      const file = await pickForRider(source, key);
      if (file) app.setDocument(key, file);
    });
  };

  const fill = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const demo = require("~/demo/customer") as typeof import("~/demo/customer");
    for (const doc of docs) {
      const file = demo.pickDemoDocument(doc.key);
      app.setDocument(doc.key, { uri: file.uri, name: file.name });
    }
  };

  return (
    <View className="flex-1">
      <Screen contentContainerStyle={{ gap: 14 }}>
        <SetupHeader step={3} total={4} label="Documents" />
        <View className="gap-1.5">
          <Text
            accessibilityRole="header"
            className="font-sans-extrabold text-[32px] leading-[38px]"
          >
            Upload your documents
          </Text>
          <Text tone="muted" className="font-sans-medium text-base leading-6">
            We check these before you can take deliveries.
          </Text>
        </View>
        <DemoFill
          label="Fill all documents"
          onFill={
            process.env.EXPO_PUBLIC_DEMO_MODE === "true" ? fill : undefined
          }
        />
        <View className="gap-3">
          {docs.map((doc) => {
            const file = app.documents[doc.key];
            return (
              <Pressable
                key={doc.key}
                onPress={() => setPicking(doc.key)}
                accessibilityRole="button"
                accessibilityLabel={`${doc.title}${file ? ", uploaded" : ", upload"}`}
                className={cn(
                  "min-h-[68px] flex-row items-center gap-3.5 rounded-card border px-4 py-3 active:opacity-90",
                  file
                    ? "border-success-border bg-success-tint"
                    : "border-dashed border-primary bg-tint",
                )}
              >
                <View
                  className={cn(
                    "h-10 w-10 items-center justify-center rounded-tile",
                    file ? "bg-card" : "bg-card",
                  )}
                >
                  <Ionicons
                    name={file ? "checkmark" : "cloud-upload-outline"}
                    size={20}
                    color={file ? colors["success-text"] : colors["brand-text"]}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-bold text-base">{doc.title}</Text>
                  <Text variant="meta" numberOfLines={1}>
                    {file ? file.name : doc.hint}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Screen>
      <SetupFooter>
        <Button
          disabled={!complete}
          onPress={() => router.push("/rider-setup/payout")}
        >
          Continue
        </Button>
      </SetupFooter>

      <MediaPickerSheet
        visible={picking !== null}
        onClose={() => setPicking(null)}
        title="Upload a document"
        onTakePhoto={() => pick("camera")}
        onChooseLibrary={() => pick("library")}
        onChooseFile={() => pick("file")}
      />
    </View>
  );
}
