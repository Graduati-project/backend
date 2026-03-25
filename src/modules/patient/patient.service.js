import * as dbService from "../../config/db.service.js";
import { DoctorModel } from "../../config/models/docter.model.js";
import { SpecialtyModel } from "../../config/models/specialty.model.js";
import {
  AppointmentModel,
  appointmentStatusEnum,
} from "../../config/models/appointment.model.js";
import { TreatmentModel } from "../../config/models/treatment.model.js";
import { asyncHandler, successResponse } from "../../utils/response/respone.js";
import { buildPaginationMeta, parsePagination } from "../../utils/pagination.js";
import { reservation as reserveAppointment } from "../appointments/appointments.service.js";

export const getSpecialtiesWithDoctors = asyncHandler(async (req, res) => {
  const { specialtyId } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const specialtyFilter = specialtyId ? { _id: specialtyId } : {};
  const [specialties, totalSpecialties] = await Promise.all([
    SpecialtyModel.find(specialtyFilter).skip(skip).limit(limit),
    SpecialtyModel.countDocuments(specialtyFilter),
  ]);

  const doctorFilter = specialtyId ? { specialtyId } : {};
  const [doctors, totalDoctors] = await Promise.all([
    DoctorModel.find(doctorFilter)
      .populate([
        { path: "userId", select: "firstName lastName email phone picture" },
        { path: "specialtyId", select: "name schedule maxAppointmentsPerDay" },
      ])
      .skip(skip)
      .limit(limit),
    DoctorModel.countDocuments(doctorFilter),
  ]);

  return successResponse({
    res,
    data: {
      specialties,
      doctors,
      pagination: {
        specialties: buildPaginationMeta({ total: totalSpecialties, page, limit }),
        doctors: buildPaginationMeta({ total: totalDoctors, page, limit }),
      },
    },
  });
});

export const myAppointments = asyncHandler(async (req, res) => {
  const appointments = await dbService.find({
    model: AppointmentModel,
    filter: { patientId: req.user._id },
    populate: [
      {
        path: "doctorId",
        populate: [
          { path: "userId", select: "firstName lastName email phone picture" },
          { path: "specialtyId", select: "name schedule maxAppointmentsPerDay" },
        ],
      },
    ],
  });

  return successResponse({
    res,
    data: { appointments },
  });
});

export const myTreatments = asyncHandler(async (req, res) => {
  const treatments = await dbService.find({
    model: TreatmentModel,
    filter: { patientId: req.user._id },
    populate: [
      {
        path: "doctorId",
        populate: [
          { path: "userId", select: "firstName lastName email phone picture" },
          { path: "specialtyId", select: "name" },
        ],
      },
    ],
  });

  return successResponse({
    res,
    data: { treatments },
  });
});

export const myDoctors = asyncHandler(async (req, res) => {
  const appointments = await dbService.find({
    model: AppointmentModel,
    filter: {
      patientId: req.user._id,
      status: {
        $in: [appointmentStatusEnum.pending, appointmentStatusEnum.confirmed],
      },
    },
    populate: [
      {
        path: "doctorId",
        populate: [
          { path: "userId", select: "firstName lastName email phone picture" },
          { path: "specialtyId", select: "name schedule maxAppointmentsPerDay" },
        ],
      },
    ],
  });

  const uniqueDoctorsMap = new Map();
  appointments.forEach((item) => {
    if (item.doctorId?._id) {
      uniqueDoctorsMap.set(item.doctorId._id.toString(), item.doctorId);
    }
  });

  return successResponse({
    res,
    data: { doctors: Array.from(uniqueDoctorsMap.values()) },
  });
});

export const bookAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.body;
  req.params.doctorID = doctorId;
  return reserveAppointment(req, res, next);
});
