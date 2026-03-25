import { Router } from "express";
import * as doctorService from "./appointments.service.js";
import * as authMiddleware from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as doctorValidation from "./appointments.validation.js";
import { roleenum } from "../../config/models/user.model.js";

const doctorAppointmentsRouter = Router();

doctorAppointmentsRouter.use(
  authMiddleware.authentication(),
  authMiddleware.authorization({ role: [roleenum.doctor] }),
);

doctorAppointmentsRouter.get("/appointments", doctorService.myAppointments);
doctorAppointmentsRouter.get("/patients", doctorService.myPatients);
doctorAppointmentsRouter.patch(
  "/appointments/:appointmentId/status",
  validation(doctorValidation.updateAppointmentStatus),
  doctorService.updateAppointmentStatus,
);
doctorAppointmentsRouter.post(
  "/treatments",
  validation(doctorValidation.createTreatment),
  doctorService.createTreatment,
);
doctorAppointmentsRouter.patch(
  "/treatments/:treatmentId",
  validation(doctorValidation.updateTreatment),
  doctorService.updateTreatment,
);

export default doctorAppointmentsRouter;
