import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiMessage } from "~/features/auth/errors";
import { useRiderId } from "~/features/rider-account/hooks";
import { handleApiError } from "~/lib/utils/error-handler";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { notifyInfo, notifySuccess } from "~/lib/utils/toast";
import DeliveriesService from "./api";
import type { DeliveryStatusChange, DeliveryTab } from "./types";

/** Lists refresh while open, so a new assignment shows up without pulling. */
const POLL_MS = 10_000;

export function useDashboard() {
  const riderId = useRiderId();
  return useQuery({
    queryKey: QUERY_KEYS.rider.dashboard,
    queryFn: () => DeliveriesService.dashboard(riderId as number),
    enabled: riderId !== null,
    refetchInterval: POLL_MS,
  });
}

export function useDeliveries(tab: DeliveryTab) {
  const riderId = useRiderId();
  return useQuery({
    queryKey: QUERY_KEYS.rider.deliveries.list(tab),
    queryFn: () => DeliveriesService.list(riderId as number, tab),
    enabled: riderId !== null,
    refetchInterval: POLL_MS,
  });
}

export function useDelivery(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.rider.deliveries.detail(id),
    queryFn: () => DeliveriesService.detail(id),
    enabled: Number.isFinite(id),
  });
}

function useRefreshDeliveries() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.rider.deliveries.all,
    });
    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.rider.dashboard,
    });
    void queryClient.invalidateQueries({ queryKey: ["rider", "earnings"] });
  };
}

export function useChangeDeliveryStatus() {
  const riderId = useRiderId();
  const refresh = useRefreshDeliveries();
  return useMutation({
    mutationFn: (input: { orderId: number; status: DeliveryStatusChange }) =>
      DeliveriesService.changeStatus({ ...input, riderId: riderId as number }),
    onSuccess: refresh,
    onError: (error) => {
      const text = getApiMessage(error);
      if (text) notifyInfo({ message: text });
      else handleApiError(error);
    },
    meta: { suppressGlobalError: true },
  });
}

export function useRequestCancellation() {
  const refresh = useRefreshDeliveries();
  return useMutation({
    mutationFn: DeliveriesService.requestCancellation,
    onSuccess: () => {
      notifySuccess({
        message: "Cancellation requested",
        description: "The team will review it.",
      });
      refresh();
    },
    onError: (error) => handleApiError(error),
    meta: { suppressGlobalError: true },
  });
}

export function useEarningSummary() {
  const riderId = useRiderId();
  return useQuery({
    queryKey: QUERY_KEYS.rider.earnings.summary,
    queryFn: () => DeliveriesService.earningSummary(riderId as number),
    enabled: riderId !== null,
  });
}

export function useEarningRows(kind: "earnings" | "collections") {
  const riderId = useRiderId();
  return useQuery({
    queryKey: QUERY_KEYS.rider.earnings.rows(kind),
    queryFn: () =>
      kind === "earnings"
        ? DeliveriesService.earnings(riderId as number)
        : DeliveriesService.collections(riderId as number),
    enabled: riderId !== null,
  });
}
