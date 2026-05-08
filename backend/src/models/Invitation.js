import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  homeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Home",
    required: true,
  },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "accepted"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

// TTL Index: Automatically delete documents 7 days after creation
invitationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model("Invitation", invitationSchema);
