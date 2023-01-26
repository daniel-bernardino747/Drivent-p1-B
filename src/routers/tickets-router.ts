import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { postCreateOrUpdateEnrollment, getTickets } from "@/controllers";
import { createEnrollmentSchema } from "@/schemas";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/", getTickets)
  .get("/types", authenticateToken)
  .post("/", validateBody(createEnrollmentSchema), postCreateOrUpdateEnrollment);

export { ticketsRouter };
