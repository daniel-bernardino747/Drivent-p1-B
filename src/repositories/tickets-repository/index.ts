import { prisma } from "@/config";

async function findTicketByUserId(id: number) {
  return prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId: id,
      },
    },
    include: {
      TicketType: true,
    },
  });
}

async function create(ticketTypeId: number, userId: number) {
  return prisma.ticket.create({
    data: {
      status: TicketStatus.RESERVED,
      TicketType: {
        connect: {
          id: ticketTypeId,
        },
      },
      Enrollment: {
        connect: {
          userId,
        },
      },
    },
    include: {
      TicketType: true,
    },
  });
}

async function checkEnrollment(userId: number) {
  return prisma.enrollment.findUnique({
    where: {
      userId,
    },
  });
}

const ticketRepository = {
  findTicketByUserId,
  create,
  checkEnrollment,
};

enum TicketStatus {
  RESERVED = "RESERVED",
  PAID = "PAID",
}

export default ticketRepository;
