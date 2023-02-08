import faker from "@faker-js/faker";
import { prisma } from "@/config";

//Sabe criar objetos - Hotel do banco
export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(
  hotelId: number,
  capacity: number = faker.datatype.number({
    min: 1,
    max: 3,
  }),
) {
  return prisma.room.create({
    data: {
      name: faker.datatype
        .number({
          min: 1000,
          max: 2000,
        })
        .toString(),
      capacity,
      hotelId: hotelId,
    },
  });
}
