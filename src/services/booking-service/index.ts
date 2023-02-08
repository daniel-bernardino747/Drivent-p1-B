import { Room } from "@prisma/client";
import { notFoundError, noVacanciesAvailableError, unauthorizedError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";
import bookingRepository from "@/repositories/booking-repository";

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
  if (!roomId) throw new Error("Body param roomId is missing");

  const ticket = await ticketRepository.findTicketByUserId(userId);
  const isRemoteTicket = ticket.TicketType.isRemote;
  const notPaidTicket = ticket.status === "RESERVED";
  const notIncludesHotel = !ticket.TicketType.includesHotel;

  if (isRemoteTicket || notPaidTicket || notIncludesHotel) throw new Error();

  const room = await bookingRepository.findRoom(roomId);
  if (!room) throw notFoundError();

  const noVacanciesInRoom = room.capacity === room.Booking.length;
  if (noVacanciesInRoom) throw noVacanciesAvailableError();

  const { id: bookingId } = await bookingRepository.createBooking(roomId, userId);

  return { bookingId };
}

async function putBooking(roomId: number, bookingId: number, userId: number) {
  if (!roomId) throw new Error("Body param roomId is missing");

  const haveBooking = await bookingRepository.findBookingById(userId);
  if (!haveBooking) throw noVacanciesAvailableError();

  const isUserBooking = haveBooking.id === bookingId;
  if (!isUserBooking) throw unauthorizedError();

  const room = await bookingRepository.findRoom(roomId);
  if (!room) throw notFoundError();

  const noVacanciesInRoom = room.capacity === room.Booking.length;
  if (noVacanciesInRoom) throw noVacanciesAvailableError();

  const { id: newBookingId } = await bookingRepository.putBooking(bookingId, roomId);

  return { bookingId: newBookingId };
}

const bookingService = {
  getBookingByUserId,
  postBooking,
  putBooking,
};

export default bookingService;
