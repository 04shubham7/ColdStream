import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
});

const IDEMPOTENCY_TTL = parseInt(process.env.IDEMPOTENCY_TTL) || 86400;

export const isDuplicateJob = async (jobId) => {
  const key = `worker:idempotency:${jobId}`;
  const exists = await redis.exists(key);
  return exists === 1;
};

export const markJobProcessed = async (jobId) => {
  const key = `worker:idempotency:${jobId}`;
  await redis.setex(key, IDEMPOTENCY_TTL, "processed");
};

export const closeRedis = async () => {
  await redis.quit();
};
