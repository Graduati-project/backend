import * as dbService from "../../config/db.service.js";
import { UserModel, roleenum } from "../../config/models/user.model.js";
import { DoctorModel } from "../../config/models/docter.model.js";
import { SpecialtyModel } from "../../config/models/specialty.model.js";
import { AppointmentModel } from "../../config/models/appointment.model.js";
import { TreatmentModel } from "../../config/models/treatment.model.js";
import { generateHash } from "../../utils/security/hash.js";
import { asyncHandler, successResponse } from "../../utils/response/respone.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";

export const addDoctor = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, gender, phone, password, specialtyId } =
    req.body;

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
  if (
    existingDoctorInSpecialty &&
    existingDoctorInSpecialty.userId?.deletedAt
  ) {
    await DoctorModel.deleteOne({ _id: existingDoctorInSpecialty._id });
  }
  if (
    existingDoctorInSpecialty &&
    !existingDoctorInSpecialty.userId?.deletedAt
  ) {
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

export const addStaff = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, gender, phone, password } = req.body;

  const checkEmail = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });
  if (checkEmail) {
    return next(new Error("Email already exists", { cause: 400 }));
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
      role: roleenum.staff,
    },
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "Staff added successfully",
    data: { user: newUser },
  });
});

const treatmentPopulateForList = [
  {
    path: "doctorId",
    populate: [
      { path: "userId", select: "firstName lastName email phone" },
      { path: "specialtyId", select: "name" },
    ],
  },
];

export const getAllPatients = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [patients, total] = await Promise.all([
    UserModel.find({ role: roleenum.patient })
      .select(
        "firstName lastName email phone age gender address medicalHistory createdAt",
      )
      .skip(skip)
      .limit(limit)
      .lean(),
    UserModel.countDocuments({ role: roleenum.patient }),
  ]);

  const patientIds = patients.map((p) => p._id);
  const allTreatments =
    patientIds.length === 0
      ? []
      : await TreatmentModel.find({ patientId: { $in: patientIds } })
          .populate(treatmentPopulateForList)
          .sort({ startDate: -1 })
          .lean();

  const treatmentsByPatient = new Map();
  for (const t of allTreatments) {
    const key = String(t.patientId);
    if (!treatmentsByPatient.has(key)) treatmentsByPatient.set(key, []);
    treatmentsByPatient.get(key).push(t);
  }

  const patientsWithTreatments = patients.map((p) => ({
    ...p,
    treatments: treatmentsByPatient.get(String(p._id)) ?? [],
  }));

  return successResponse({
    res,
    data: {
      patients: patientsWithTreatments,
      pagination: buildPaginationMeta({ total, page, limit }),
    },
  });
});

export const getPatientDetails = asyncHandler(async (req, res, next) => {
  const { patientId } = req.params;

  const patient = await dbService.findById({
    model: UserModel,
    id: patientId,
    select:
      "firstName lastName email phone age gender address medicalHistory createdAt role",
  });
  if (!patient || patient.role !== roleenum.patient) {
    return next(new Error("Patient not found", { cause: 404 }));
  }

  const appointments = await dbService.find({
    model: AppointmentModel,
    filter: { patientId },
    populate: [
      {
        path: "doctorId",
        populate: [
          { path: "userId", select: "firstName lastName email phone" },
          { path: "specialtyId", select: "name" },
        ],
      },
    ],
  });

  const treatments = await dbService.find({
    model: TreatmentModel,
    filter: { patientId },
    populate: [
      {
        path: "doctorId",
        populate: [
          { path: "userId", select: "firstName lastName email phone" },
          { path: "specialtyId", select: "name" },
        ],
      },
    ],
  });

  const patientPlain = patient.toObject ? patient.toObject() : patient;

  return successResponse({
    res,
    data: {
      patient: { ...patientPlain, treatments },
      appointments,
    },
  });
});

export const getAllDoctors = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const [doctors, total] = await Promise.all([
    DoctorModel.find()
      .populate([
        { path: "userId", select: "firstName lastName email phone picture gender" },
        { path: "specialtyId", select: "name schedule maxAppointmentsPerDay" },
      ])
      .skip(skip)
      .limit(limit)
      .lean(),
    DoctorModel.countDocuments(),
  ]);

  const validDoctors = doctors.filter((d) => d.userId && d.specialtyId);

  return successResponse({
    res,
    data: {
      doctors: validDoctors,
      pagination: buildPaginationMeta({ total, page, limit }),
    },
  });
});

export const getAllAppointments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const [appointments, total] = await Promise.all([
    AppointmentModel.find()
      .populate([
        {
          path: "doctorId",
          populate: [
            { path: "userId", select: "firstName lastName email phone" },
            { path: "specialtyId", select: "name" },
          ],
        },
        {
          path: "patientId",
          select: "firstName lastName email phone",
        },
      ])
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AppointmentModel.countDocuments(),
  ]);

  return successResponse({
    res,
    data: {
      appointments,
      pagination: buildPaginationMeta({ total, page, limit }),
    },
  });
});
