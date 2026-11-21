import { useRouter } from "expo-router";
import { SavedScreen } from "./saved-screen";

// Shown after a successful create. New items stay hidden from customers until
// admin approval and shop verification, so the copy sets that expectation.
export function ItemSavedScreen() {
  const router = useRouter();

  return (
    <SavedScreen
      message="Your item goes live once it has been approved and your shop is verified. You can check its status in your catalogue."
      primaryLabel="View catalogue"
      onPrimary={() => router.dismissTo("/catalogue")}
      secondaryLabel="Add another"
      onSecondary={() =>
        router.dismissTo({ pathname: "/catalogue", params: { add: "1" } })
      }
    />
  );
}
