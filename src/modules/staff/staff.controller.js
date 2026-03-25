import { Router } from "express";
import * as authMiddleware from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { roleenum } from "../../config/models/user.model.js";
import * as staffValidation from "./staff.validation.js";
import * as staffService from "./staff.service.js";

const staffRouter = Router();

staffRouter.use(
  authMiddleware.authentication(),
  authMiddleware.authorization({ role: [roleenum.staff, roleenum.admin] }),
);

staffRouter.post(
  "/doctors",
  validation(staffValidation.addDoctor),
  staffService.addDoctor,
);
staffRouter.get("/patients", staffService.getAllPatients);
staffRouter.get(
  "/patients/:patientId",
  validation(staffValidation.patientIdParam),
  staffService.getPatientDetails,
);

export default staffRouter;
