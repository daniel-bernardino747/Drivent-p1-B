import { notFoundError, noVacanciesAvailableError } from "@/errors";
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

async function postBooking(roomId: number, userId: number) {
  const room = await bookingRepository.findRoom(roomId);

  const noVacanciesInRoom = room.capacity === room.Booking.length;

  if (!room) throw notFoundError();
  if (noVacanciesInRoom) throw noVacanciesAvailableError();

  const { id: bookingId } = await bookingRepository.createBooking(roomId, userId);

  return { bookingId };
}

const bookingService = {
  getBookingByUserId,
  postBooking,
};

export default bookingService;
