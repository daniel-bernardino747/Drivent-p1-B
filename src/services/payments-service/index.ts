import ticketRepository from "@/repositories/tickets-repository";
import { notFoundError, unauthorizedError } from "@/errors";
import paymentRepository from "@/repositories/payment-repository";
import { Payment } from "@prisma/client";

async function getPayments(ticketId: number, userId: number): Promise<Payment> {
  if (!ticketId) throw new Error("Ticket id is required");

  const payment = await paymentRepository.findPayments(ticketId);
  if (!payment) throw notFoundError();

  const paymentUser = await paymentRepository.findPaymentsByUserId(ticketId, userId);
  if (!paymentUser) throw unauthorizedError();

  return payment;
}

async function createPaymentProcess(paymentProcess: CreatePaymentProcessSchema & { userId: number }): Promise<Payment> {
  const ticketUser = await ticketRepository.findTicketByIdAndUserId(paymentProcess.ticketId, paymentProcess.userId);

  const updatedTicket = await ticketRepository.updateStatusTicket(paymentProcess.ticketId);

  const paymentPaid = await paymentRepository.createProcess({
    ...paymentProcess,
    value: updatedTicket.TicketType.price,
  });

  if (!updatedTicket) throw notFoundError();
  if (!ticketUser) throw unauthorizedError();
  if (!paymentPaid) throw notFoundError();

  return paymentPaid;
}

const paymentsService = {
  getPayments,
  createPaymentProcess,
};

export type CreatePaymentProcessSchema = {
  ticketId: number;
  cardData: {
    issuer: string;
    number: number;
    name: string;
    expirationDate: Date;
    cvv: number;
  };
};

export default paymentsService;
