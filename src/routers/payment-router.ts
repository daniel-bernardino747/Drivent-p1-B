import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getPayments, postCreatePaymentProcess } from "@/controllers";
import { createPaymentProcessSchema } from "@/schemas";

const paymentRouter = Router();

paymentRouter
  .all("/*", authenticateToken)
  .get("/", getPayments)
  .post("/process", validateBody(createPaymentProcessSchema), postCreatePaymentProcess);

export { paymentRouter };
