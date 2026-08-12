import crypto from "crypto";
import { EmailJob } from "./emailJob.model.js";
import { redis } from "../../config/redis.js";
import { produceMessage } from "../../config/kafka.js";
import { ApiError } from "../../utils/ApiError.js";

const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
const RATE_LIMIT_MAX = 50; // 50 emails per hour
const IDEMPOTENCY_TTL = 86400; // 24 hours
const DISPATCH_TOPIC = "email-dispatch-topic";

export const dispatchEmail = async (userId, data) => {
  await checkRateLimit(userId);

  const jobId = generateJobId();
  const idempotencyKey = `${userId}:${data.recruiterEmail}:${data.templateId}`;

  const isDuplicate = await checkIdempotency(idempotencyKey);
  if (isDuplicate) {
    throw ApiError.conflict("Duplicate dispatch request detected");
  }

  const emailJob = await EmailJob.create({
    jobId,
    userId,
    recruiterEmail: data.recruiterEmail,
    templateId: data.templateId,
    resumeId: data.resumeId,
    variables: data.variables || {},
    status: "queued",
  });

  await setIdempotencyKey(idempotencyKey, jobId);
  await incrementRateLimit(userId);

  await produceMessage(DISPATCH_TOPIC, {
    jobId,
    userId: userId.toString(),
    recruiterEmail: data.recruiterEmail,
    templateId: data.templateId,
    resumeId: data.resumeId,
    variables: data.variables || {},
    createdAt: emailJob.createdAt.toISOString(),
  });

  return emailJob;
};

export const getJobStatus = async (userId, jobId) => {
  const job = await EmailJob.findOne({ jobId, userId });
  if (!job) {
    throw ApiError.notFound("Job not found");
  }
  return job;
};

export const getUserJobs = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    EmailJob.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("templateId", "name subject")
      .populate("resumeId", "name fileName"),
    EmailJob.countDocuments({ userId }),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const updateJobStatus = async (jobId, status, error = null) => {
  const update = { status };
  if (status === "sent") {
    update.sentAt = new Date();
  }
  if (error) {
    update.lastError = error;
  }

  return EmailJob.findOneAndUpdate({ jobId }, { $set: update }, { new: true });
};

export const incrementRetry = async (jobId) => {
  return EmailJob.findOneAndUpdate(
    { jobId },
    { $inc: { retryCount: 1 } },
    { new: true }
  );
};

const checkRateLimit = async (userId) => {
  const key = `dispatch_rate:${userId}`;
  const count = await redis.get(key);

  if (count && parseInt(count) >= RATE_LIMIT_MAX) {
    throw ApiError.tooMany(
      `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX} emails per hour.`
    );
  }
};

const incrementRateLimit = async (userId) => {
  const key = `dispatch_rate:${userId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW);
  }
};

const checkIdempotency = async (key) => {
  const existing = await redis.get(`idempotency:${key}`);
  return !!existing;
};

const setIdempotencyKey = async (key, jobId) => {
  await redis.setex(`idempotency:${key}`, IDEMPOTENCY_TTL, jobId);
};

const generateJobId = () => {
  return `job_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
};
