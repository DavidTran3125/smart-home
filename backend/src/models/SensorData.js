import mongoose from "mongoose";

const sensorDataSchema = new mongoose.Schema({
  device_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  type: { type: String },
  value: { type: Number, required: true },
  unit: { type: String },
});

export default mongoose.model("SensorData", sensorDataSchema);
