import { SpecialtyModel } from "../models/specialty.model.js";
import { dayEnum } from "../models/specialty.model.js";
import { UserModel, roleenum } from "../models/user.model.js";
import { DoctorModel } from "../models/docter.model.js";
import { generateHash } from "../../utils/security/hash.js";
import * as dbService from "../../config/db.service.js";
const specialties = [
  {
    name: "Dentistry",
    schedule: [
      { day: dayEnum.sunday, startTime: "12:00", endTime: "22:00" },
      { day: dayEnum.wednesday, startTime: "12:00", endTime: "22:00" },
    ],
    maxAppointmentsPerDay: 30,
  },
  {
    name: "Ophthalmology",
    schedule: [
      { day: dayEnum.monday, startTime: "10:00", endTime: "18:00" },
      { day: dayEnum.thursday, startTime: "10:00", endTime: "18:00" },
    ],
    maxAppointmentsPerDay: 30,
  },
  {
    name: "Internal Medicine",
    schedule: [
      { day: dayEnum.tuesday, startTime: "09:00", endTime: "17:00" },
      { day: dayEnum.saturday, startTime: "09:00", endTime: "17:00" },
    ],
    maxAppointmentsPerDay: 30,
  },
  {
    name: "Pediatrics",
    schedule: [
      { day: dayEnum.sunday, startTime: "09:00", endTime: "15:00" },
      { day: dayEnum.thursday, startTime: "14:00", endTime: "20:00" },
    ],
    maxAppointmentsPerDay: 30,
  },
  {
    name: "Orthopedics",
    schedule: [
      { day: dayEnum.monday, startTime: "12:00", endTime: "20:00" },
      { day: dayEnum.wednesday, startTime: "09:00", endTime: "15:00" },
    ],
    maxAppointmentsPerDay: 30,
  },
  {
    name: "Dermatology",
    schedule: [
      { day: dayEnum.tuesday, startTime: "12:00", endTime: "20:00" },
      { day: dayEnum.saturday, startTime: "12:00", endTime: "20:00" },
    ],
    maxAppointmentsPerDay: 30,
  },
];

export const seedSpecialties = async () => {
  const existingSpecialties = await SpecialtyModel.find({}, "name");
  const existingNames = new Set(existingSpecialties.map((item) => item.name));

  const missingSpecialties = specialties.filter(
    (specialty) => !existingNames.has(specialty.name),
  );

  if (!missingSpecialties.length) {
    console.log("Specialties already seeded, skipping...");
    return;
  }

  await SpecialtyModel.insertMany(missingSpecialties);
  console.log(
    `Seeded ${missingSpecialties.length} missing specialties successfully`,
  );
};

export const seedDoctor = async () => {
  const existingDoctor = await UserModel.findOne({ email: "admin@test.com" });
  if (existingDoctor) {
    console.log("Doctor account already seeded, skipping...");
    return;
  }

  const hashedPassword = await generateHash("123456");
  const specialty = await SpecialtyModel.findOne({ name: "Dentistry" });

  const user = await dbService.create({
    model: UserModel,
    data: {
      firstName: "Admin",
      lastName: "Doctor",
      email: "admin@test.com",
      phone: "01000000000",
      gender: "male",
      password: hashedPassword,
      role: roleenum.doctor,
    },
  });

  await dbService.create({
    model: DoctorModel,
    data: {
      userId: user._id,
      specialtyId: specialty._id,
    },
  });

  console.log("Seeded doctor account (admin@test.com) successfully");
};
