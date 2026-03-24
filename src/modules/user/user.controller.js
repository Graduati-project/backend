import { Router } from "express";
import * as userService from "./user.service.js";
import * as autMiddleware from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js";
import { endPoint } from "./user.authorization.js";
import {
  fileValidation,
  localfileUpload,
} from "../../utils/multer/local.multer.js";
const userRouter = Router();

userRouter.get("/profile", autMiddleware.authentication(), userService.profile);

userRouter.patch(
  "/update",
  autMiddleware.authentication(),
  validation(validators.updateBasicInfo),
  userService.updateBasicInfo,
);

userRouter.delete(
  "{/:userId}/frezze-account",
  autMiddleware.authentication(),
  validation(validators.frezzeAccount),
  userService.frezzeAccount,
);

userRouter.patch(
  "/restore-account/:userId",
  autMiddleware.authentication(),
  autMiddleware.authorization({ role: endPoint.restoreAccount }),
  userService.restoreAccount,
);

userRouter.patch(
  "/update-password",
  autMiddleware.authentication(),
  validation(validators.updatePassword),
  userService.updatePassword,
);

userRouter.delete(
  "/:userId",
  validation(validators.deleteAccount),
  autMiddleware.authentication(),
  autMiddleware.authorization({ role: endPoint.deleteAccount }),
  userService.deleteAccount,
);

userRouter.post(
  "/logout",
  autMiddleware.authentication(),
  validation(validators.logout),
  userService.logout,
);

userRouter.patch(
  "/profile-image",
  autMiddleware.authentication(),
  localfileUpload({
    customPath: "User",
    validation: fileValidation.image,
  }).single("image"),
  validation(validators.updateProfileImage),
  userService.profileImage,
);

userRouter.get(
  "/all",
  autMiddleware.authentication(),
  autMiddleware.authorization({ role: endPoint.getAllUsers }),
  userService.getAllUsers,
);

export default userRouter;
