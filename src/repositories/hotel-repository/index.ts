import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findOneHotel(hotelId: number) {
  return prisma.hotel.findUnique({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

async function findUserPaidTicket(userId: number) {
  return prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId,
      },
    },
    include: {
      Enrollment: true,
      TicketType: true,
    },
  });
}

const hotelRepository = {
  findHotels,
  findOneHotel,
  findUserPaidTicket,
};

export default hotelRepository;
