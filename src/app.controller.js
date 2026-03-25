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
import { seedSpecialties } from "./config/seed/specialties.seed.js";
import appointmentsRouter from "./modules/appointments/appointments.controller.js";
export const Bootsrap = async () => {
  const app = express();
  const port = process.env.PORT;

  app.use(cors());
  app.use(express.json());
  await connectDB();
  await seedSpecialties();

  app.use("/auth", authController);
  app.use("/user", userRouter);
  app.use("/appointments", appointmentsRouter);
  app.use(globalErrorHandler);
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};
