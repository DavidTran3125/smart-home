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

// Only one active invitation per email per home.
invitationSchema.index(
  { email: 1, homeId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

export default mongoose.model("Invitation", invitationSchema);
