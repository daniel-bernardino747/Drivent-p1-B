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

async function findAllTicketWithType() {
  return prisma.ticketType.findMany();
}

async function findTicketByIdAndUserId(id: number, userId: number) {
  return prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId,
      },
      id,
    },
    include: {
      TicketType: true,
    },
  });
}

async function updateStatusTicket(ticketId: number) {
  return prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: TicketStatus.PAID,
    },
    include: {
      TicketType: true,
    },
  });
}

const ticketRepository = {
  findTicketByUserId,
  create,
  checkEnrollment,
  findAllTicketWithType,
  updateStatusTicket,
  findTicketByIdAndUserId,
};

enum TicketStatus {
  RESERVED = "RESERVED",
  PAID = "PAID",
}

export default ticketRepository;
