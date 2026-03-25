import Router from "express";
import * as appointmentsService from "./appointments.service.js";
import * as authMiddleware from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { reservationValidation } from "./appointments.validation.js";
const appointmentsRouter = Router();

appointmentsRouter.get("/doctors", appointmentsService.getAllDoctors);

appointmentsRouter.post(
  "/reservation/:doctorID",
  authMiddleware.authentication(),
  validation(reservationValidation),
  appointmentsService.reservation,
);

export default appointmentsRouter;
