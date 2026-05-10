import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
  role: {
    type: String,
    enum: ["Gia đình", "Admin", "SystemAdmin"],
    default: "Gia đình",
  },
  status: {
    type: String,
    enum: ["active", "invalid"],
    default: "active",
    index: true,
  },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  homeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Home",
    // required: function () {
    //   return this.role !== "SystemAdmin";
    // },
    index: true,
  },
  invalidated_at: { type: Date },
  invalidated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  invalid_reason: { type: String },
  reactivated_at: { type: Date },
  reactivated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
