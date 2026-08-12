import mongoose from "mongoose";

const emailJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recruiterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    variables: {
      type: Map,
      of: String,
      default: {},
    },
    status: {
      type: String,
      enum: ["queued", "processing", "sent", "failed", "dlq"],
      default: "queued",
      index: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    lastError: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emailJobSchema.index({ userId: 1, createdAt: -1 });
emailJobSchema.index({ status: 1, createdAt: 1 });

export const EmailJob = mongoose.model("EmailJob", emailJobSchema);
