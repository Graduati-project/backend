import * as dbService from "../../config/db.service.js";
import { DoctorModel } from "../../config/models/docter.model.js";
import {
  AppointmentModel,
  appointmentStatusEnum,
} from "../../config/models/appointment.model.js";
import { TreatmentModel } from "../../config/models/treatment.model.js";
import { asyncHandler, successResponse } from "../../utils/response/respone.js";
import { buildPaginationMeta, parsePagination } from "../../utils/pagination.js";

export const myAppointments = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const doctor = await dbService.findOne({
    model: DoctorModel,
    filter: { userId: req.user._id },
  });
  if (!doctor) {
    return next(new Error("Doctor profile not found", { cause: 404 }));
  }

  const [appointments, total] = await Promise.all([
    AppointmentModel.find({ doctorId: doctor._id })
      .populate([
        {
          path: "patientId",
          select: "firstName lastName email phone age gender medicalHistory",
        },
      ])
      .skip(skip)
      .limit(limit),
    AppointmentModel.countDocuments({ doctorId: doctor._id }),
  ]);

  return successResponse({
    res,
    data: {
      appointments,
      pagination: buildPaginationMeta({ total, page, limit }),
    },
  });
});

export const updateAppointmentStatus = asyncHandler(async (req, res, next) => {
  const doctor = await dbService.findOne({
    model: DoctorModel,
    filter: { userId: req.user._id },
  });
  if (!doctor) {
    return next(new Error("Doctor profile not found", { cause: 404 }));
  }

  const { appointmentId } = req.params;
  const { status } = req.body;

  const appointment = await dbService.findOneAndUpdate({
    model: AppointmentModel,
    filter: { _id: appointmentId, doctorId: doctor._id },
    data: { status },
  });
  if (!appointment) {
    return next(new Error("Appointment not found", { cause: 404 }));
  }

  return successResponse({
    res,
    message: "Appointment status updated successfully",
    data: { appointment },
  });
});

export const myPatients = asyncHandler(async (req, res, next) => {
  const doctor = await dbService.findOne({
    model: DoctorModel,
    filter: { userId: req.user._id },
  });
  if (!doctor) {
    return next(new Error("Doctor profile not found", { cause: 404 }));
  }

  const appointments = await dbService.find({
    model: AppointmentModel,
    filter: {
      doctorId: doctor._id,
      status: {
        $in: [
          appointmentStatusEnum.confirmed,
          appointmentStatusEnum.completed,
          appointmentStatusEnum.pending,
        ],
      },
    },
    populate: [
      {
        path: "patientId",
        select: "firstName lastName email phone age gender medicalHistory",
      },
    ],
  });

  const uniquePatientsMap = new Map();
  appointments.forEach((item) => {
    if (item.patientId?._id) {
      uniquePatientsMap.set(item.patientId._id.toString(), item.patientId);
    }
  });

  const patientsList = Array.from(uniquePatientsMap.values());
  const patientMongoIds = patientsList.map((p) => p._id);

  const treatmentsForPatients =
    patientMongoIds.length === 0
      ? []
      : await TreatmentModel.find({
          doctorId: doctor._id,
          patientId: { $in: patientMongoIds },
        })
          .sort({ startDate: -1 })
          .lean();

  const treatmentsByPatient = new Map();
  for (const t of treatmentsForPatients) {
    const key = String(t.patientId);
    if (!treatmentsByPatient.has(key)) treatmentsByPatient.set(key, []);
    treatmentsByPatient.get(key).push(t);
  }

  const patientsWithTreatments = patientsList.map((p) => {
    const plain = p.toObject ? p.toObject() : { ...p };
    return {
      ...plain,
      treatments: treatmentsByPatient.get(String(p._id)) ?? [],
    };
  });

  return successResponse({
    res,
    data: { patients: patientsWithTreatments },
  });
});

export const createTreatment = asyncHandler(async (req, res, next) => {
  const doctor = await dbService.findOne({
    model: DoctorModel,
    filter: { userId: req.user._id },
  });
  if (!doctor) {
    return next(new Error("Doctor profile not found", { cause: 404 }));
  }

  const { patientId, treatmentName, startDate, endDate } = req.body;

  const hasRelationship = await dbService.findOne({
    model: AppointmentModel,
    filter: {
      doctorId: doctor._id,
      patientId,
      status: { $ne: appointmentStatusEnum.cancelled },
    },
  });
  if (!hasRelationship) {
    return next(
      new Error(
        "Doctor can add treatment only for patients with at least one non-cancelled appointment with this doctor. Use the patient's User _id as patientId.",
        { cause: 403 },
      ),
    );
  }

  const treatment = await dbService.create({
    model: TreatmentModel,
    data: {
      patientId,
      doctorId: doctor._id,
      treatmentName,
      startDate,
      endDate,
    },
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "Treatment created successfully",
    data: { treatment },
  });
});

export const updateTreatment = asyncHandler(async (req, res, next) => {
  const doctor = await dbService.findOne({
    model: DoctorModel,
    filter: { userId: req.user._id },
  });
  if (!doctor) {
    return next(new Error("Doctor profile not found", { cause: 404 }));
  }

  const { treatmentId } = req.params;
  const treatment = await dbService.findOneAndUpdate({
    model: TreatmentModel,
    filter: { _id: treatmentId, doctorId: doctor._id },
    data: req.body,
  });
  if (!treatment) {
    return next(new Error("Treatment not found", { cause: 404 }));
  }

  return successResponse({
    res,
    message: "Treatment updated successfully",
    data: { treatment },
  });
});
