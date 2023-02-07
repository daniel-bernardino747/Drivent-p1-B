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

const bookingRepository = {
  findBookingById,
};

export default bookingRepository;
