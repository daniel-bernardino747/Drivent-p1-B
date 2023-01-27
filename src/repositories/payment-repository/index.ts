import { prisma } from "@/config";

async function findPayments(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      Ticket: {
        id: ticketId,
      },
    },
  });
}

async function findPaymentsByUserId(ticketId: number, userId: number) {
  return prisma.payment.count({
    where: {
      Ticket: {
        AND: [{ id: ticketId }, { Enrollment: { User: { id: userId } } }],
      },
    },
  });
}

const paymentRepository = {
  findPayments,
  findPaymentsByUserId,
};

export default paymentRepository;
