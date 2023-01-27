import { CreatePaymentProcessSchema } from "@/services";
import Joi from "joi";

export const createPaymentProcessSchema = Joi.object<CreatePaymentProcessSchema>({
  ticketId: Joi.number().required(),
  cardData: Joi.object({
    issuer: Joi.string().required(),
    number: Joi.number().required(),
    name: Joi.string().required(),
    expirationDate: Joi.date().required(),
    cvv: Joi.number().required(),
  }).required(),
});
