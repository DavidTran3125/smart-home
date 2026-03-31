import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
  role: { type: String, enum: ["Gia đình", "Admin"], default: "Gia đình" },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
