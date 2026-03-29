import { asyncHandler, successResponse } from "../../utils/response/respone.js";
import * as dbService from "../../config/db.service.js";
import { roleenum, UserModel } from "../../config/models/user.model.js";
import { compareHash, generateHash } from "../../utils/security/hash.js";
import { logoutEnum, revokeToken } from "../../utils/security/token.js";
import { DoctorModel } from "../../config/models/docter.model.js";
import { SpecialtyModel } from "../../config/models/specialty.model.js";
import { TreatmentModel } from "../../config/models/treatment.model.js";
import { buildPaginationMeta, parsePagination } from "../../utils/pagination.js";

const treatmentPopulateForPatient = [
  {
    path: "doctorId",
    populate: [
      { path: "userId", select: "firstName lastName email phone picture" },
      { path: "specialtyId", select: "name" },
    ],
  },
];

export const profile = asyncHandler(async (req, res, next) => {
  const userObj = req.user.toObject ? req.user.toObject() : { ...req.user };
  if (req.user.role === roleenum.patient) {
    const treatments = await TreatmentModel.find({ patientId: req.user._id })
      .populate(treatmentPopulateForPatient)
      .sort({ startDate: -1 })
      .lean();
    return successResponse({
      res,
      data: { ...userObj, treatments },
    });
  }
  return successResponse({
    res,
    data: userObj,
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
  const targetUser = await dbService.findById({
    model: UserModel,
    id: userId,
  });
  if (!targetUser) {
    return next(new Error("in valied user id", { cause: 400 }));
  }

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
  if (targetUser.role === roleenum.doctor) {
    await DoctorModel.deleteOne({ userId: targetUser._id });
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

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [getUsers, total] = await Promise.all([
    UserModel.find().skip(skip).limit(limit),
    UserModel.countDocuments(),
  ]);
  return successResponse({
    res,
    data: {
      getUsers,
      pagination: buildPaginationMeta({ total, page, limit }),
    },
  });
});

export const addDoctor = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, gender, phone, password, specialtyId } = req.body;

  const checkEmail = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });
  if (checkEmail) {
    return next(new Error("Email already exists", { cause: 400 }));
  }

  const specialty = await dbService.findById({
    model: SpecialtyModel,
    id: specialtyId,
  });
  if (!specialty) {
    return next(new Error("Specialty not found", { cause: 404 }));
  }

  const existingDoctorInSpecialty = await DoctorModel.findOne({
    specialtyId,
  }).populate({
    path: "userId",
    select: "deletedAt",
  });
  if (existingDoctorInSpecialty && existingDoctorInSpecialty.userId?.deletedAt) {
    await DoctorModel.deleteOne({ _id: existingDoctorInSpecialty._id });
  }
  if (existingDoctorInSpecialty && !existingDoctorInSpecialty.userId?.deletedAt) {
    return next(
      new Error("This specialty already has a doctor assigned", { cause: 409 }),
    );
  }

  const hashedPassword = await generateHash(password);
  const newUser = await dbService.create({
    model: UserModel,
    data: {
      firstName,
      lastName,
      email,
      gender,
      phone,
      password: hashedPassword,
      role: roleenum.doctor,
    },
  });

  const doctor = await dbService.create({
    model: DoctorModel,
    data: {
      userId: newUser._id,
      specialtyId,
    },
  });

  return successResponse({
    res,
    message: "Doctor added successfully",
    data: { user: newUser, doctor },
  });
});
