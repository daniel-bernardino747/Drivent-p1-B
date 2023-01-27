import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getPayments, postCreateTicket } from "@/controllers";
import { createTicketSchema } from "@/schemas";

const paymentRouter = Router();

paymentRouter
  .all("/*", authenticateToken)
  .get("/", getPayments)
  .post("/", validateBody(createTicketSchema), postCreateTicket);

export { paymentRouter };
