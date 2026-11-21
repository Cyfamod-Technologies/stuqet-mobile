import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ListRow } from "~/components/ui/list-row";

interface MediaPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  onTakePhoto: () => void;
  onChooseLibrary: () => void;
  /** Shown only when provided (document upload rows). */
  onChooseFile?: () => void;
  /** Subtitle of the "Choose a file" row (board: "JPG, PNG or PDF"). */
  fileSubtitle?: string;
}

// The one picker sheet behind every "Add photo", "Change logo" and upload row
// (PhotoSheet / DocSheet / IdSheet boards): Take photo, Choose from library
// and, for documents, Choose a file, then a Cancel pill. The default title is
// "Add a photo" ("Add a photo or file" with a file row); callers pass the board
// title for documents ("Upload a document", "Upload your school ID"). The sheet
// only collects the choice; callers do the picking and uploading.
export function MediaPickerSheet({
  visible,
  onClose,
  title,
  onTakePhoto,
  onChooseLibrary,
  onChooseFile,
  fileSubtitle = "JPG, PNG or PDF",
}: MediaPickerSheetProps) {
  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title ?? (onChooseFile ? "Add a photo or file" : "Add a photo")}
    >
      <Card className="overflow-hidden p-0">
        <ListRow
          icon="camera-outline"
          title="Take photo"
          subtitle="Use your camera"
          onPress={run(onTakePhoto)}
        />
        <ListRow
          icon="image-outline"
          title="Choose from library"
          subtitle="Photos on this phone"
          onPress={run(onChooseLibrary)}
          last={!onChooseFile}
        />
        {onChooseFile ? (
          <ListRow
            icon="document-outline"
            title="Choose a file"
            subtitle={fileSubtitle}
            onPress={run(onChooseFile)}
            last
          />
        ) : null}
      </Card>
      <Button variant="outline" onPress={onClose}>
        Cancel
      </Button>
    </BottomSheet>
  );
}
