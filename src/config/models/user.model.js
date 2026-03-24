import mongoose from "mongoose";
export const roleenum = {
  admin: "admin",
  doctor: "doctor",
  patient: "patient",
  staff: "staff",
};
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: [30, "Too long name"],
    },
    lastName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: [30, "Too long name"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(roleenum), // ["admin", "doctor", "patient"]
      default: roleenum.patient,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },

    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restoredAt: { type: Date },
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    resetPasswordLastSent: { type: Date },
    changeCredentialsTime: { type: Date },
  },
  {
    timestamps: true,
  },
);
userSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  },
});

export const UserModel =
  mongoose.model.User || mongoose.model("User", userSchema);
