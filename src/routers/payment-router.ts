import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getPayments, postCreateTicket } from "@/controllers";
import { createPaymentProcessSchema } from "@/schemas";

const paymentRouter = Router();

paymentRouter
  .all("/*", authenticateToken)
  .get("/", getPayments)
  .post("/", validateBody(createPaymentProcessSchema), postCreateTicket);

export { paymentRouter };
