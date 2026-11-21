import { isDemoMode } from "~/demo/flag";

/**
 * Whether the Support tickets feature is shown (More row + screens).
 *
 * TODO(backend): the mobile API (routes/api_seller.php) has no support-ticket
 * endpoints; only the web seller panel does. It is off by default so nothing
 * calls a missing endpoint. Set `EXPO_PUBLIC_ENABLE_SUPPORT_TICKETS="true"`
 * once the endpoints in api.ts exist. Demo mode turns it on, answering from
 * the bundled sample tickets.
 */
export const isSupportTicketsEnabled =
  process.env.EXPO_PUBLIC_ENABLE_SUPPORT_TICKETS === "true" || isDemoMode;

export const MAX_SUBJECT_LENGTH = 120;
export const MAX_MESSAGE_LENGTH = 2000;
