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

// Index tối ưu hóa truy vấn lịch sử (sort desc theo timestamp)
sensorDataSchema.index({ timestamp: -1 });
// Index compound cho truy vấn theo thiết bị + thời gian
sensorDataSchema.index({ device_id: 1, timestamp: -1 });

export default mongoose.model("SensorData", sensorDataSchema);
