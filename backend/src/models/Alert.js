import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  device_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    required: true,
  },
  severity: { type: String, enum: ["Thấp", "Trung bình", "Cao"] },
  type: { type: String },
  unit: { type: String },
  threshold_value: { type: Number },
  direction: { type: String, enum: ["above", "below"] },
  message: { type: String },
  value_at_alert: { type: Number },
  status: {
    type: String,
    enum: ["Chưa xử lý", "Đã xử lý"],
    default: "Chưa xử lý",
  },
  detected_at: { type: Date, default: Date.now },
  resolved_at: { type: Date },
});

export default mongoose.model("Alert", alertSchema);
