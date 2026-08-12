import { redis } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";

export const rateLimiter = (windowSeconds = 60, maxRequests = 100) => {
  return async (req, _res, next) => {
    const key = `ratelimit:${req.ip}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    try {
      await redis.zremrangebyscore(key, 0, windowStart);
      const requestCount = await redis.zcard(key);

      if (requestCount >= maxRequests) {
        throw ApiError.tooMany("Rate limit exceeded. Try again later.");
      }

      await redis.zadd(key, now, `${now}`);
      await redis.expire(key, windowSeconds);

      next();
    } catch (error) {
      if (error.isOperational) {
        return next(error);
      }
      next();
    }
  };
};
