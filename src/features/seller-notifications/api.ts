import { axiosPrivate } from "~/lib/config/axios";
import type {
  RawNotificationList,
  RawUnreadResponse,
  SellerNotification,
} from "./types";
import { toNotification, unwrapNotifications } from "./utils";

// Shared customer routes (routes/api.php); sellers use them too.
const NotificationsService = {
  /**
   * `all-notification` marks everything as read as a side effect, so the
   * unread ids are fetched first to keep the unread dots.
   */
  getAll: async (): Promise<SellerNotification[]> => {
    const unread = await axiosPrivate.get<RawUnreadResponse>(
      "/unread-notifications",
    );
    const unreadIds = new Set(
      unwrapNotifications(unread.data.data).map((n) => n.id),
    );

    const all = await axiosPrivate.get<RawNotificationList>(
      "/all-notification",
    );
    return unwrapNotifications(all.data.data).map((raw) =>
      toNotification(raw, unreadIds),
    );
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await axiosPrivate.get<RawUnreadResponse>(
      "/unread-notifications",
    );
    return data.count ?? 0;
  },
};

export default NotificationsService;
