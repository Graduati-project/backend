import { asyncHandler, successResponse } from "../../utils/response/respone.js";
import * as dbService from "../../config/db.service.js";
import { roleenum, UserModel } from "../../config/models/user.model.js";
import { compareHash, generateHash } from "../../utils/security/hash.js";
import { logoutEnum, revokeToken } from "../../utils/security/token.js";

export const profile = asyncHandler(async (req, res, next) => {
  return successResponse({
    res,
    data: req.user,
  });
});

export const updateBasicInfo = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: req.body,
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return successResponse({
    res,
    message: "User updated successfully",
    data: user,
    statusCode: 200,
  });
});

export const frezzeAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role != roleenum.admin) {
    return next(new Error("Unauthorized", { cause: 403 }));
  }

  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId || req.user._id,
      deletedAt: { $exists: false },
    },

    data: {
      deletedAt: Date.now(),
      deletedBy: req.user._id,
      $unset: {
        restoredAt: 1,
        restoredBy: 1,
      },
    },
  });

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  return successResponse({
    res,
    message: "User frezzed successfully",
    data: user,
    statusCode: 200,
  });
});

export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (req.user.role !== roleenum.admin) {
    return next(new Error("Unauthorized", { cause: 403 }));
  }
  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: true },
    },

    data: {
      restoredAt: Date.now(),
      restoredBy: req.user._id,
      $unset: {
        deletedAt: 1,
        deletedBy: 1,
      },
    },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return successResponse({
    res,
    message: "User restored successfully",
    data: user,
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, flag } = req.body;
  const isOldPassCorrect = await compareHash({
    plaintext: oldPassword,
    hash: req.user.password,
  });

  if (!isOldPassCorrect) {
    return next(new Error("Old Password is incorrect"));
  }
  const hashedPassword = await generateHash(newPassword);

  await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: req.user._id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return successResponse({
    res,
    message: "Password updated successfully",
  });
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await dbService.deleteOne({
    model: UserModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: true },
    },
  });

  if (!user.deletedCount) {
    return next(new Error("in valied user id", { cause: 400 }));
  }
  return successResponse({
    res,
    message: "User deleted successfully",
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const { flag } = req.body;
  let status = 200;
  let Resdata;
  switch (flag) {
    case logoutEnum.signOutFromAll:
      const revokTokenAll = await dbService.updateOne({
        model: UserModel,
        filter: {
          _id: req.user._id,
        },
        data: {
          changeCredentialsTime: new Date(),
        },
      });
      break;

    case logoutEnum.signout:
      await revokeToken({ req });
      status = 201;
      break;
  }

  return successResponse({
    res,
    status,
    message: "Logout successful",
  });
});

export const profileImage = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: req.user._id,
    },
    data: {
      picture: req.file.finalPath,
    },
  });
  return successResponse({
    res,
    data: { user },
    message: "Profile image updated successfully",
  });
});
