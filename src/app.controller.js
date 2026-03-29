import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });
import express from "express";
import connectDB from "./config/connection.db.js";
import authController from "../src/modules/Auth/auth.controller.js";
import cors from "cors";
import userRouter from "./modules/user/user.controller.js";
import { globalErrorHandler } from "./utils/response/respone.js";
import { seedSpecialties, seedDoctors } from "./config/seed/specialties.seed.js";
import appointmentsRouter from "./modules/appointments/appointments.controller.js";
import doctorAppointmentsRouter from "./modules/Doctor/appointments.controller.js";
import staffRouter from "./modules/staff/staff.controller.js";
import patientRouter from "./modules/patient/patient.controller.js";
export const Bootsrap = async () => {
  const app = express();
  const port = process.env.PORT;

  app.use(cors());
  app.use(express.json());
  await connectDB();
  await seedSpecialties();
  await seedDoctors();

  app.use("/auth", authController);
  app.use("/user", userRouter);
  app.use("/appointments", appointmentsRouter);
  app.use("/doctor", doctorAppointmentsRouter);
  app.use("/staff", staffRouter);
  app.use("/patient", patientRouter);
  // app.all("*", (req, res, next) => {
  //   return next(new Error(`Cannot ${req.method} ${req.originalUrl}`, { cause: 404 }));
  // });
  app.use(globalErrorHandler);
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};
