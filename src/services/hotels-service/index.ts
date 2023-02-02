import { notFoundError, paymentRequiredError } from "@/errors";
import { ApplicationError } from "@/protocols";
import hotelRepository from "@/repositories/hotel-repository";

async function getHotels(userId: number) {
  verifyHotel(userId);

  const hotels = await hotelRepository.findHotels();
  if (!hotels) throw notFoundError();

  return hotels;
}

async function getHotel(hotelId: number, userId: number) {
  verifyHotel(userId);

  const hotel = await hotelRepository.findOneHotel(hotelId);
  if (!hotel) throw notFoundError();

  return hotel;
}

async function verifyHotel(userId: number): Promise<void | ApplicationError> {
  const existingPaidTicket = await hotelRepository.findUserPaidTicket(userId);
  if (!existingPaidTicket) throw notFoundError();

  const notPaid = existingPaidTicket.status !== "PAID";
  const isRemote = existingPaidTicket.TicketType.isRemote;
  const notIncludesHotel = !existingPaidTicket.TicketType.includesHotel;

  if (notPaid || isRemote || notIncludesHotel) throw paymentRequiredError();
}

const hotelService = {
  getHotels,
  getHotel,
};

export default hotelService;
