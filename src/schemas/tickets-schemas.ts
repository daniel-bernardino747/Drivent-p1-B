import { BodyCreatedTicket } from "@/services";
import Joi from "joi";

export const createTicketSchema = Joi.object<BodyCreatedTicket>({
  ticketTypeId: Joi.number().required(),
});
