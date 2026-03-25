import mongoose from "mongoose";

export const appointmentStatusEnum = {
  pending: "pending",
  confirmed: "confirmed",
  cancelled: "cancelled",
  completed: "completed",
};

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(appointmentStatusEnum),
      default: appointmentStatusEnum.pending,
    },
  },
  {
    timestamps: true,
  },
);

export const AppointmentModel =
  mongoose.model.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

AppointmentModel.syncIndexes();
