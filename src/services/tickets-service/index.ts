import { Ticket } from "@prisma/client";
import { notFoundError } from "@/errors";
import ticketRepository from "@/repositories/tickets-repository";

async function getTicket(id: number) {
  const ticket = await ticketRepository.findTicketByUserId(id);

  if (!ticket) throw notFoundError();

  return ticket;
}

async function getAllTicketWithType() {
  const ticketsTypes = await ticketRepository.findAllTicketWithType();
  if (!ticketsTypes) return [];

  return ticketsTypes;
}
async function createTicket({ ticketTypeId, userId }: CreatedTicket): Promise<Ticket> {
  const enrollment = await ticketRepository.checkEnrollment(userId);

  if (!enrollment) throw notFoundError();

  const ticketCreated = await ticketRepository.create(ticketTypeId, userId);

  return ticketCreated;
}

const ticketsService = {
  getTicket,
  createTicket,
  getAllTicketWithType,
};

type CreatedTicket = {
  ticketTypeId: number;
  userId: number;
};

export type BodyCreatedTicket = Omit<CreatedTicket, "userId">;

export default ticketsService;
