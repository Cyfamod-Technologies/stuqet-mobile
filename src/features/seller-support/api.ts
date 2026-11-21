import { axiosPrivate } from "~/lib/config/axios";
import type {
  CreatedTicket,
  CreateTicketPayload,
  ReplyPayload,
  Ticket,
  TicketPage,
} from "./types";

// TODO(backend): none of these endpoints exist in routes/api_seller.php. The
// web seller panel has support tickets (Ticket / TicketReply models, routes
// `seller/support_ticket*`); the mobile API needs the proposed REST routes
// below. Keep the shapes in sync with ../types.ts. Nothing calls them unless
// EXPO_PUBLIC_ENABLE_SUPPORT_TICKETS is "true".
const SupportService = {
  // GET /seller/support-tickets?page=
  //   -> { data: TicketSummary[], meta: { current_page, last_page, total } }
  getTickets: async (page: number): Promise<TicketPage> => {
    const { data } = await axiosPrivate.get<TicketPage>(
      "/seller/support-tickets",
      { params: { page } },
    );
    return data;
  },

  // GET /seller/support-tickets/{id} -> { data: Ticket } (messages oldest first)
  getTicket: async (id: number): Promise<Ticket> => {
    const { data } = await axiosPrivate.get<{ data: Ticket }>(
      `/seller/support-tickets/${id}`,
    );
    return data.data;
  },

  // POST /seller/support-tickets { subject, details, attachments }
  //   -> { result: true, message, data: { id, code } }
  createTicket: async (
    payload: CreateTicketPayload,
  ): Promise<CreatedTicket> => {
    const { data } = await axiosPrivate.post<{ data: CreatedTicket }>(
      "/seller/support-tickets",
      payload,
    );
    return data.data;
  },

  // POST /seller/support-tickets/{id}/replies { reply, attachments }
  replyToTicket: async ({
    ticketId,
    reply,
    attachments,
  }: ReplyPayload): Promise<void> => {
    await axiosPrivate.post(`/seller/support-tickets/${ticketId}/replies`, {
      reply,
      attachments,
    });
  },
};

export default SupportService;
