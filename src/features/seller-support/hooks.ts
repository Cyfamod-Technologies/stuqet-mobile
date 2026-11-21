import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { handleApiError } from "~/lib/utils/error-handler";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import SupportService from "./api";
import { isSupportTicketsEnabled } from "./constants";

export function useTickets() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.seller.support.tickets,
    queryFn: ({ pageParam }) => SupportService.getTickets(pageParam),
    initialPageParam: 1,
    getNextPageParam: ({ meta }) =>
      meta && meta.current_page < meta.last_page
        ? meta.current_page + 1
        : undefined,
    enabled: isSupportTicketsEnabled,
    meta: { suppressGlobalError: true },
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.support.ticket(id),
    queryFn: () => SupportService.getTicket(id),
    enabled: isSupportTicketsEnabled && Number.isFinite(id),
    meta: { suppressGlobalError: true },
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: SupportService.createTicket,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seller.support.tickets,
      }),
    onError: (error) => handleApiError(error),
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: SupportService.replyToTicket,
    onSuccess: (_data, { ticketId }) =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seller.support.ticket(ticketId),
      }),
    onError: (error) => handleApiError(error),
  });
}
