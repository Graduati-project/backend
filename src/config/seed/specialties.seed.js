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

const doctors = [
  {
    firstName: "Ahmed",
    lastName: "Hassan",
    email: "dr.ahmed@test.com",
    phone: "01000000001",
    gender: "male",
    specialty: "Dentistry",
  },
  {
    firstName: "Sara",
    lastName: "Mohamed",
    email: "dr.sara@test.com",
    phone: "01000000002",
    gender: "female",
    specialty: "Ophthalmology",
  },
  {
    firstName: "Khaled",
    lastName: "Ali",
    email: "dr.khaled@test.com",
    phone: "01000000003",
    gender: "male",
    specialty: "Internal Medicine",
  },
  {
    firstName: "Mona",
    lastName: "Ibrahim",
    email: "dr.mona@test.com",
    phone: "01000000004",
    gender: "female",
    specialty: "Pediatrics",
  },
  {
    firstName: "Omar",
    lastName: "Youssef",
    email: "dr.omar@test.com",
    phone: "01000000005",
    gender: "male",
    specialty: "Orthopedics",
  },
  {
    firstName: "Nour",
    lastName: "Adel",
    email: "dr.nour@test.com",
    phone: "01000000006",
    gender: "female",
    specialty: "Dermatology",
  },
];

export const seedDoctors = async () => {
  await DoctorModel.syncIndexes();
  const specialtiesList = await SpecialtyModel.find();
  if (!specialtiesList.length) {
    console.log("No specialties found, seed specialties first");
    return;
  }

  const specialtyMap = new Map(specialtiesList.map((s) => [s.name, s._id]));
  const hashedPassword = await generateHash("123456");
  let seededCount = 0;

  for (const doc of doctors) {
    const existingUser = await UserModel.findOne({ email: doc.email });
    if (existingUser) continue;

    const specialtyId = specialtyMap.get(doc.specialty);
    if (!specialtyId) continue;

    const user = await dbService.create({
      model: UserModel,
      data: {
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        phone: doc.phone,
        gender: doc.gender,
        password: hashedPassword,
        role: roleenum.doctor,
      },
    });

    await dbService.create({
      model: DoctorModel,
      data: { userId: user._id, specialtyId },
    });

    seededCount++;
  }

  if (seededCount) {
    console.log(`Seeded ${seededCount} doctor accounts successfully`);
  } else {
    console.log("Doctor accounts already seeded, skipping...");
  }
};
