/** One row of GET /seller/conversations (Seller\ConversationResource). */
export interface RawConversation {
  id: number;
  image: string | null;
  /** The customer's name. */
  name: string | null;
  /** Subject the customer started the chat with (usually a product name). */
  title: string | null;
  /** Only sent by some backend versions (ConversationCollection); optional. */
  is_seen?: boolean;
}

export interface RawConversationList {
  data: RawConversation[];
}

/** One entry of GET /seller/conversations/show/{id} (MessageCollection). */
export interface RawMessage {
  id: number;
  user_id: number;
  /** user_type of the sender: "customer", "seller"... */
  send_type: string;
  message: string;
  year: string;
  /** "01".."12". */
  month: string;
  /** "d-M", e.g. "21-Nov". */
  day_of_month: string;
  /** "F d, Y", e.g. "November 21, 2026". */
  date: string;
  /** "h:i a", e.g. "03:04 pm". */
  time: string;
}

export interface RawMessageList {
  data: RawMessage[];
}

export interface Conversation {
  id: number;
  name: string;
  image: string | null;
  title: string | null;
}

export interface ChatMessage {
  id: number;
  userId: number;
  /** True when the signed-in seller wrote it. */
  mine: boolean;
  text: string;
  createdAt: Date | null;
  /** Optimistic message that the server has not confirmed yet. */
  pending?: boolean;
}

export interface SendMessageInput {
  conversationId: number;
  message: string;
  /** Seller's user id, for the optimistic bubble. */
  sellerId: number | null;
}
