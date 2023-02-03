import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { Hotel, Room } from "@prisma/client";

export async function createHotelWithRooms(): Promise<Hotel & { Rooms: Room[] }> {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.avatar(),
      Rooms: {
        createMany: {
          data: [
            {
              name: faker.name.firstName(),
              capacity: faker.datatype.number({ min: 1, max: 2 }),
            },
            {
              name: faker.name.firstName(),
              capacity: faker.datatype.number({ min: 1, max: 2 }),
            },
          ],
        },
      },
    },
    include: {
      Rooms: true,
    },
  });
}
