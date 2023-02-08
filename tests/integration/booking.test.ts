import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import * as jwt from "jsonwebtoken";
import * as factory from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await factory.createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user not have a booking", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const createdHotel = await factory.createHotel();
      await factory.createRoomWithHotelId(createdHotel.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and with booking data", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);

      const booking = await factory.createBooking(room.id, user.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: booking.Room.id,
          name: booking.Room.name,
          capacity: booking.Room.capacity,
          hotelId: booking.Room.hotelId,
          createdAt: booking.Room.createdAt.toISOString(),
          updatedAt: booking.Room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await factory.createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 if body param roomId is missing", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      await factory.createRoomWithHotelId(hotel.id);

      const body = {};

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when given ticket type is not remote", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeRemote();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);

      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when given ticket type not includes hotel", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithoutHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);

      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when given ticket is not paid", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithoutHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);

      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 when given room doesnt exist", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      await factory.createHotel();

      const body = { roomId: 1 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when given room capacity has already been filled", async () => {
      const user = await factory.createUser();
      const otherUser = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id, 1);

      await factory.createBooking(room.id, otherUser.id);

      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and with bookingId param", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);

      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: expect.any(Number) });
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await factory.createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 if body param roomId is missing", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      await factory.createRoomWithHotelId(hotel.id);

      const body = {};

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when given user not have booking", async () => {
      const user = await factory.createUser();
      const otherUser = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);
      const otherRoom = await factory.createRoomWithHotelId(hotel.id);

      const booking = await factory.createBooking(room.id, otherUser.id);

      const body = { roomId: otherRoom.id };

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 401 when given booking user is not the bookingId param ", async () => {
      const user = await factory.createUser();
      const otherUser = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);
      const otherRoom = await factory.createRoomWithHotelId(hotel.id);

      const otherBooking = await factory.createBooking(room.id, otherUser.id);
      await factory.createBooking(room.id, user.id);

      const body = { roomId: otherRoom.id };

      const response = await server
        .put(`/booking/${otherBooking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(body);

      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 404 when given room doesnt exist", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);

      const booking = await factory.createBooking(room.id, user.id);

      const body = { roomId: 1 };

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when given room capacity has already been filled", async () => {
      const user = await factory.createUser();
      const otherUser = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);
      const otherRoom = await factory.createRoomWithHotelId(hotel.id, 1);

      const booking = await factory.createBooking(room.id, user.id);

      await factory.createBooking(otherRoom.id, otherUser.id);

      const body = { roomId: otherRoom.id };

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and with bookingId param", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);
      const otherRoom = await factory.createRoomWithHotelId(hotel.id);

      const booking = await factory.createBooking(room.id, user.id);

      const body = { roomId: otherRoom.id };

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: expect.any(Number) });
    });
  });
});
