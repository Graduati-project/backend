import { SpecialtyModel } from "../models/specialty.model.js";
import { dayEnum } from "../models/specialty.model.js";
const specialties = [
  
  {
    name: "Dentistry",
    schedule: [
      { day: dayEnum.sunday, startTime: "12:00", endTime: "22:00" },
      { day: dayEnum.wednesday, startTime: "12:00", endTime: "22:00" },
    ],
    maxAppointmentsPerDay: 10,
  },
  {
    name: "Ophthalmology",
    schedule: [
      { day: dayEnum.monday, startTime: "10:00", endTime: "18:00" },
      { day: dayEnum.thursday, startTime: "10:00", endTime: "18:00" },
    ],
    maxAppointmentsPerDay: 8,
  },
  {
    name: "Internal Medicine",
    schedule: [
      { day: dayEnum.tuesday, startTime: "09:00", endTime: "17:00" },
      { day: dayEnum.saturday, startTime: "09:00", endTime: "17:00" },
    ],
    maxAppointmentsPerDay: 12,
  },
  {
    name: "Pediatrics",
    schedule: [
      { day: dayEnum.sunday, startTime: "09:00", endTime: "15:00" },
      { day: dayEnum.thursday, startTime: "14:00", endTime: "20:00" },
    ],
    maxAppointmentsPerDay: 10,
  },
  {
    name: "Orthopedics",
    schedule: [
      { day: dayEnum.monday, startTime: "12:00", endTime: "20:00" },
      { day: dayEnum.wednesday, startTime: "09:00", endTime: "15:00" },
    ],
    maxAppointmentsPerDay: 8,
  },
  {
    name: "Dermatology",
    schedule: [
      { day: dayEnum.tuesday, startTime: "12:00", endTime: "20:00" },
      { day: dayEnum.saturday, startTime: "12:00", endTime: "20:00" },
    ],
    maxAppointmentsPerDay: 10,
  },
];


export const seedSpecialties = async () => {
  const count = await SpecialtyModel.countDocuments();
  if (count > 0) {
    console.log("Specialties already seeded, skipping...");
    return;
  }
  await SpecialtyModel.insertMany(specialties);
  console.log(`Seeded ${specialties.length} specialties successfully`);
};
