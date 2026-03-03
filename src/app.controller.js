import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from "express";
import connectDB from "./config/connection.db.js";
import authController from "../src/modules/Auth/auth.controller.js";
import cors from "cors";
import userRouter from "./modules/user/user.controller.js";
export const Bootsrap = async () => {
  const app = express();
  const port = process.env.PORT;

  app.use(cors());
  app.use(express.json());
  await connectDB();

  app.use("/auth", authController);
  app.use("/user", userRouter);
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};
