import { axiosPrivate } from "~/lib/config/axios";
import type {
  Conversation,
  RawConversationList,
  RawMessageList,
  SendMessageInput,
} from "./types";

const MessagesService = {
  /** GET /seller/conversations. Rejects when the admin switched chat off. */
  list: async (): Promise<Conversation[]> => {
    const { data } = await axiosPrivate.get<RawConversationList>(
      "/seller/conversations",
    );
    return (data.data ?? []).map((c) => ({
      id: c.id,
      name: c.name?.trim() || "Customer",
      image: c.image || null,
      title: c.title?.trim() || null,
    }));
  },

  /** GET /seller/conversations/show/{id}: messages, newest first. */
  getMessages: async (id: number): Promise<RawMessageList["data"]> => {
    const { data } = await axiosPrivate.get<RawMessageList>(
      `/seller/conversations/show/${id}`,
    );
    return data.data ?? [];
  },

  /** POST /seller/conversations/message/store. */
  send: async ({
    conversationId,
    message,
  }: SendMessageInput): Promise<void> => {
    await axiosPrivate.post("/seller/conversations/message/store", {
      conversation_id: conversationId,
      message,
    });
  },
};

export default MessagesService;
