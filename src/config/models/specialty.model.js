import mongoose from "mongoose";

export const dayEnum = {
  saturday: "saturday",
  sunday: "sunday",
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
};

const scheduleSlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: Object.values(dayEnum),
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const specialtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    schedule: {
      type: [scheduleSlotSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "Specialty must have at least one scheduled day",
      },
    },
    maxAppointmentsPerDay: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

export const SpecialtyModel =
  mongoose.model.Specialty || mongoose.model("Specialty", specialtySchema);

SpecialtyModel.syncIndexes();
