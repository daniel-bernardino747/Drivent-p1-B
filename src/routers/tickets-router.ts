import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getTickets, postCreateTicket } from "@/controllers";
import { createTicketSchema } from "@/schemas";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/", getTickets)
  .get("/types", authenticateToken)
  .post("/", validateBody(createTicketSchema), postCreateTicket);

export { ticketsRouter };
