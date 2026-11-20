import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import NotificationsService from "./api";

const UNREAD_KEY = [...QUERY_KEYS.seller.notifications, "unread"] as const;

/** Notification list. Fetching it marks everything as read server-side. */
export function useNotifications() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: QUERY_KEYS.seller.notifications,
    queryFn: async () => {
      const items = await NotificationsService.getAll();
      queryClient.setQueryData(UNREAD_KEY, 0);
      return items;
    },
    staleTime: 0,
    meta: { suppressGlobalError: true },
  });
}

/** Drives the orange dot on Home's bell. Fails quietly (no dot). */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: UNREAD_KEY,
    queryFn: NotificationsService.getUnreadCount,
    staleTime: 60 * 1000,
    meta: { suppressGlobalError: true },
  });
}
