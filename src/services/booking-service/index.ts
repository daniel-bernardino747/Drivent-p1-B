import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import { Room } from "@prisma/client";

interface RoomUser {
  id: number;
  Room: Room;
}

async function getBookingByUserId(id: number): Promise<RoomUser> {
  const room = await bookingRepository.findBookingById(id);
  if (!room) throw notFoundError();

  return room;
}

const bookingService = {
  getBookingByUserId,
};

export default bookingService;
