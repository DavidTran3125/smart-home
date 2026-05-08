import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  model: { type: String },
  feed_name: { type: String, unique: true, sparse: true }, // Mapping tới MQTT feed (vd: 'temp', 'fan')
  pin: { type: Number },
  pin_mode: { type: String },
  status: { type: String, enum: ["Bật", "Tắt"], default: "Tắt" },
  threshold_min_value: { type: Number },
  threshold_max_value: { type: Number },
  threshold_is_active: { type: Boolean, default: false },
  homeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Home",
    required: true,
    index: true,
  },
  last_seen: { type: Date, default: Date.now },
});

export default mongoose.model("Device", deviceSchema);
