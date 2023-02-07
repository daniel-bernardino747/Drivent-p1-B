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

async function putBooking(roomId: number, bookingId: number, userId: number) {
  const haveBooking = await bookingRepository.findBookingById(userId);
  if (haveBooking) throw noVacanciesAvailableError();

  const isUserBooking = haveBooking.id === bookingId;
  if (!isUserBooking) throw noVacanciesAvailableError();

  const room = await bookingRepository.findRoom(roomId);
  if (!room) throw notFoundError();

  const noVacanciesInRoom = room.capacity === room.Booking.length;
  if (noVacanciesInRoom) throw noVacanciesAvailableError();

  const { id: newBookingId } = await bookingRepository.putBooking(bookingId, roomId);

  return { newBookingId };
}

const bookingService = {
  getBookingByUserId,
  postBooking,
  putBooking,
};

export default bookingService;
