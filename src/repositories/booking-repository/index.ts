import { prisma } from "@/config";

async function findBookingById(id: number) {
  return prisma.booking.findFirst({
    where: {
      userId: id,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function createBooking(roomId: number, userId: number) {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

async function findRoom(id: number) {
  return prisma.room.findUnique({
    where: {
      id,
    },
    include: {
      Booking: true,
    },
  });
}

const bookingRepository = {
  findBookingById,
  createBooking,
  findRoom,
};

export default bookingRepository;
