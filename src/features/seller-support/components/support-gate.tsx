import type { ReactNode } from "react";
import { EmptyState } from "~/components/ui/empty-state";
import { FormScreen } from "~/features/seller-account/components/form-screen";
import { isSupportTicketsEnabled } from "../constants";

// Support tickets need endpoints the mobile API does not have yet
// (TODO(backend), see api.ts). Behind the flag the screens render normally;
// without it a deep link lands on this placeholder instead of a dead request.
export function SupportGate({ children }: { children: ReactNode }) {
  if (isSupportTicketsEnabled) return children;

  return (
    <FormScreen title="Support tickets">
      <EmptyState
        icon="headset-outline"
        title="Support tickets are not available yet"
        message="This feature is coming soon."
      />
    </FormScreen>
  );
}
