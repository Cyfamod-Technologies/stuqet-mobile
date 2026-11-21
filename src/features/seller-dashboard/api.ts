import { axiosPrivate } from "~/lib/config/axios";
import type { RawSalesStat, SalesDay } from "./types";

const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

const DashboardService = {
  /** GET /seller/dashboard/sales-stat — delivered orders, last 7 days. */
  getSalesStat: async (): Promise<SalesDay[]> => {
    const { data } = await axiosPrivate.get<RawSalesStat>(
      "/seller/dashboard/sales-stat",
    );
    // Keys run 1 (today) to 7 (six days ago); build the chart oldest first.
    const newestFirst = Object.entries(data ?? {})
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, day]) => day);

    const today = new Date();
    return newestFirst
      .map((day, offset): SalesDay => {
        const date = new Date(today);
        date.setDate(today.getDate() - offset);
        return {
          date: day.date,
          total: Number(day.total) || 0,
          label: WEEKDAY_INITIALS[date.getDay()],
          isToday: offset === 0,
        };
      })
      .reverse();
  },
};

export default DashboardService;
