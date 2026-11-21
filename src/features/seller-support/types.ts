/** Ticket state shown as a badge: Pending (red), Open (neutral), Solved. */
export type TicketStatus = "pending" | "open" | "solved";

/** One row of the ticket list. */
export interface TicketSummary {
  id: number;
  /** Public reference, e.g. "20260102". Shown as "#20260102". */
  code: string;
  subject: string;
  status: TicketStatus;
  /** ISO or `Y-m-d H:i:s`. */
  created_at: string;
}

/** One message of a ticket thread (the first one is the ticket details). */
export interface TicketMessage {
  id: number;
  body: string;
  /** True for a reply from Stuqet support, false for the seller. */
  from_support: boolean;
  sender_name?: string | null;
  /** Photo URLs. */
  attachments: string[];
  created_at: string;
}

export interface Ticket extends TicketSummary {
  messages: TicketMessage[];
}

export interface CreateTicketPayload {
  subject: string;
  details: string;
  /** Upload id of the optional photo (from /file/image-upload). */
  attachments: string | null;
}

export interface CreatedTicket {
  id: number;
  code: string;
}

export interface ReplyPayload {
  ticketId: number;
  reply: string;
  /** Upload id of the optional photo. */
  attachments: string | null;
}

/** Laravel paginated resource collection. */
export interface TicketPage {
  data: TicketSummary[];
  meta?: { current_page: number; last_page: number; total: number };
}
