import { asyncHandler, successResponse } from "../../utils/response/respone.js";
import * as dbService from "../../config/db.service.js";
import { DoctorModel } from "../../config/models/docter.model.js";
import {
  AppointmentModel,
  appointmentStatusEnum,
} from "../../config/models/appointment.model.js";
import { buildPaginationMeta, parsePagination } from "../../utils/pagination.js";

const dayToIndex = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function getNextDateForDay(dayName, hour) {
  const now = new Date();
  const targetDay = dayToIndex[dayName];
  const currentDay = now.getUTCDay();

  let daysUntil = targetDay - currentDay;
  if (daysUntil < 0) daysUntil += 7;

  if (daysUntil === 0) {
    const [h, m] = hour.split(":").map(Number);
    if (
      now.getUTCHours() > h ||
      (now.getUTCHours() === h && now.getUTCMinutes() >= m)
    ) {
      daysUntil = 7;
    }
  }

  const date = new Date(now);
  date.setUTCDate(now.getUTCDate() + daysUntil);
  const [h, m] = hour.split(":").map(Number);
  date.setUTCHours(h, m, 0, 0);
  return date;
}

export const reservation = asyncHandler(async (req, res, next) => {
  const DOCTOR_DAILY_LIMIT = 30;
  const { doctorID } = req.params;
  const { _id: patientId } = req.user;
  const { hour, day } = req.body;

  const doctor = await dbService.findOne({
    model: DoctorModel,
    filter: { _id: doctorID },
    populate: [{ path: "specialtyId" }],
  });
  if (!doctor) {
    return next(new Error("Doctor not found", { cause: 404 }));
  }

  const specialty = doctor.specialtyId;
  if (!specialty) {
    return next(
      new Error("Doctor specialty not found. Please contact staff.", {
        cause: 404,
      }),
    );
  }

  const scheduleSlot = specialty.schedule.find((s) => s.day === day);
  if (!scheduleSlot) {
    return next(
      new Error("Doctor is not available on this day", { cause: 400 }),
    );
  }

  if (hour < scheduleSlot.startTime || hour >= scheduleSlot.endTime) {
    return next(
      new Error(
        `This hour is outside working hours (${scheduleSlot.startTime} - ${scheduleSlot.endTime})`,
        { cause: 400 },
      ),
    );
  }

  const appointmentDate = getNextDateForDay(day, hour);

  const patientHasDoctorInSameSpecialty = await AppointmentModel.findOne({
    patientId,
    status: { $in: [appointmentStatusEnum.pending, appointmentStatusEnum.confirmed] },
    date: { $gte: new Date() },
  }).populate({
    path: "doctorId",
    match: {
      specialtyId: specialty._id,
      _id: { $ne: doctorID },
    },
  });
  if (patientHasDoctorInSameSpecialty?.doctorId) {
    return next(
      new Error(
        "You already have another doctor in this specialty",
        { cause: 409 },
      ),
    );
  }

  const startOfDay = new Date(appointmentDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const dayAppointments = await dbService.find({
    model: AppointmentModel,
    filter: {
      doctorId: doctorID,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: appointmentStatusEnum.cancelled },
    },
  });

  if (dayAppointments.length >= DOCTOR_DAILY_LIMIT) {
    return next(new Error("No available slots for this day", { cause: 409 }));
  }

  const slotTaken = dayAppointments.some(
    (apt) => apt.date.getTime() === appointmentDate.getTime(),
  );
  if (slotTaken) {
    return next(new Error("This time slot is already booked", { cause: 409 }));
  }

  const alreadyBooked = dayAppointments.some(
    (apt) => apt.patientId.toString() === patientId.toString(),
  );
  if (alreadyBooked) {
    return next(
      new Error(
        "You already have an appointment with this doctor on this day",
        { cause: 409 },
      ),
    );
  }

  const appointment = await dbService.create({
    model: AppointmentModel,
    data: {
      doctorId: doctorID,
      patientId,
      date: appointmentDate,
    },
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "Appointment booked successfully",
    data: { appointment },
  });
});

export const getAllDoctors = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [doctors, total] = await Promise.all([
    DoctorModel.find()
      .populate([
        { path: "userId", select: "firstName lastName email phone picture" },
        { path: "specialtyId", select: "name schedule maxAppointmentsPerDay" },
      ])
      .skip(skip)
      .limit(limit),
    DoctorModel.countDocuments(),
  ]);

  return successResponse({
    res,
    data: {
      doctors,
      pagination: buildPaginationMeta({ total, page, limit }),
    },
  });
});
