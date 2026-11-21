import { useRouter } from "expo-router";
import { SavedScreen } from "~/features/seller-products/components/saved-screen";

// Shown after a successful service create (same approval and verification
// wait as products and food).
export function ServiceSavedScreen() {
  const router = useRouter();

  return (
    <SavedScreen
      message="Your service goes live once it has been approved and your shop is verified. You can check its status in your services."
      primaryLabel="View services"
      onPrimary={() => router.dismissTo("/services")}
      secondaryLabel="Add another"
      onSecondary={() => router.replace("/services/add")}
    />
  );
}
