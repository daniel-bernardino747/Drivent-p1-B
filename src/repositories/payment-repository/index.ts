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

async function createProcess({ ticketId, value, cardData: { issuer, number } }: CreatePaymentProcessSchema) {
  return prisma.payment.create({
    data: {
      ticketId,
      cardIssuer: issuer,
      cardLastDigits: number.toString().slice(-4),
      value,
    },
  });
}

const paymentRepository = {
  findPayments,
  findPaymentsByUserId,
  createProcess,
};

type CreatePaymentProcessSchema = {
  value: number;
  ticketId: number;
  cardData: {
    issuer: string;
    number: number;
  };
};

export default paymentRepository;
