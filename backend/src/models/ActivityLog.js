import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  device_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
  }, // Có thể null nếu là log hệ thống
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true },
  description: { type: String },
});

export default mongoose.model("ActivityLog", activityLogSchema);
