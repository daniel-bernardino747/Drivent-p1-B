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

const ticketRepository = {
  findTicketByUserId,
};

export default ticketRepository;
