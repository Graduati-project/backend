import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialtyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

export const DoctorModel =
  mongoose.model.Doctor || mongoose.model("Doctor", doctorSchema);

DoctorModel.syncIndexes().catch((err) => {
  console.error("DoctorModel.syncIndexes failed:", err?.message || err);
});
