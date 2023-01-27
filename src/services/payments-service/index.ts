import { notFoundError, unauthorizedError } from "@/errors";
import paymentRepository from "@/repositories/payment-repository";

async function getPayments(ticketId: number, userId: number) {
  if (!ticketId) throw new Error("Ticket id is required");

  const payment = await paymentRepository.findPayments(ticketId);
  if (!payment) throw notFoundError();

  const paymentUser = await paymentRepository.findPaymentsByUserId(ticketId, userId);
  if (!paymentUser) throw unauthorizedError();

  return payment;
}

const paymentsService = {
  getPayments,
};

export default paymentsService;
