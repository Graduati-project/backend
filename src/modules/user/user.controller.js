import { Router } from "express";
import * as userService from "./user.service.js";
import * as autMiddleware from "../../middleware/authentication.middleware.js";

const userRouter = Router();

userRouter.get("/profile", autMiddleware.authMiddleware, userService.profile);

export default userRouter;
