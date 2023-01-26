import { notFoundError } from "@/errors";
import ticketRepository from "@/repositories/tickets-repository";

async function getTicket(id: number) {
  const ticket = await ticketRepository.findTicketByUserId(id);

  if (!ticket) throw notFoundError();

  return ticket;
}

const ticketsService = {
  getTicket,
};

export default ticketsService;
