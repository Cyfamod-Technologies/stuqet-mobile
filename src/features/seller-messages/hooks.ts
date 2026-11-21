import { useEffect } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { handleApiError } from "~/lib/utils/error-handler";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import MessagesService from "./api";
import { useMessageReadStore } from "./read-store";
import type { ChatMessage, Conversation, SendMessageInput } from "./types";
import { toChatMessages } from "./utils";

/** Conversations refetch on this interval while the list screen is mounted. */
const LIST_POLL_MS = 30_000;
/** The open chat polls faster so replies show up without a websocket. */
const THREAD_POLL_MS = 8_000;
/** The list loads a preview for this many conversations (newest first). */
const PREVIEW_LIMIT = 30;

export function useConversations() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.messages.conversations,
    queryFn: MessagesService.list,
    refetchInterval: LIST_POLL_MS,
    meta: { suppressGlobalError: true },
  });
}

function useSellerId(): number | null {
  return useShopInfo().data?.user_id ?? null;
}

/** Messages of one conversation, oldest first. */
export function useThread(conversationId: number, poll = false) {
  const sellerId = useSellerId();

  return useQuery({
    queryKey: QUERY_KEYS.seller.messages.thread(conversationId),
    queryFn: async (): Promise<ChatMessage[]> =>
      toChatMessages(
        await MessagesService.getMessages(conversationId),
        sellerId,
      ),
    enabled: Number.isFinite(conversationId),
    refetchInterval: poll ? THREAD_POLL_MS : false,
    meta: { suppressGlobalError: true },
  });
}

export interface ConversationPreview {
  conversation: Conversation;
  /** Newest message, once its thread has loaded. */
  last: ChatMessage | null;
  unread: boolean;
}

/**
 * The list endpoint returns no last message, time or unread flag, so each row
 * loads its thread (same cache entry the chat screen uses) and derives them.
 */
export function useConversationPreviews(conversations: Conversation[]) {
  const sellerId = useSellerId();
  const lastRead = useMessageReadStore((s) => s.lastRead);
  const hydrate = useMessageReadStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const results = useQueries({
    queries: conversations.slice(0, PREVIEW_LIMIT).map((c) => ({
      queryKey: QUERY_KEYS.seller.messages.thread(c.id),
      queryFn: async (): Promise<ChatMessage[]> =>
        toChatMessages(await MessagesService.getMessages(c.id), sellerId),
      staleTime: 30_000,
      meta: { suppressGlobalError: true },
    })),
  });

  return conversations.map((conversation, index): ConversationPreview => {
    const messages = results[index]?.data;
    const last = messages?.[messages.length - 1] ?? null;
    const unread =
      last !== null &&
      !last.mine &&
      last.id > (lastRead[String(conversation.id)] ?? 0);
    return { conversation, last, unread };
  });
}

/** Optimistic send (docs/optimistic-updates.md): bubble first, roll back on error. */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendMessageInput) => MessagesService.send(input),
    meta: { suppressGlobalError: true },

    onMutate: async ({ conversationId, message, sellerId }) => {
      const key = QUERY_KEYS.seller.messages.thread(conversationId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ChatMessage[]>(key);
      const pending: ChatMessage = {
        id: Number.MAX_SAFE_INTEGER,
        userId: sellerId ?? 0,
        mine: true,
        text: message,
        createdAt: new Date(),
        pending: true,
      };
      queryClient.setQueryData<ChatMessage[]>(key, (old) => [
        ...(old ?? []),
        pending,
      ]);
      return { previous, key };
    },

    onError: (error, _input, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      handleApiError(error);
    },

    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seller.messages.thread(input.conversationId),
      });
    },
  });
}

/** Marks a thread as read on this device whenever its newest message changes. */
export function useMarkThreadRead(
  conversationId: number,
  messages: ChatMessage[] | undefined,
) {
  const markRead = useMessageReadStore((s) => s.markRead);
  const hydrate = useMessageReadStore((s) => s.hydrate);
  const newest = messages?.[messages.length - 1];
  const newestId = newest && !newest.pending ? newest.id : null;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (newestId !== null) markRead(conversationId, newestId);
  }, [conversationId, newestId, markRead]);
}
