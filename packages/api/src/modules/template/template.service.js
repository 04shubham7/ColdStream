import { Template } from "./template.model.js";
import { redis } from "../../config/redis.js";
import { ApiError } from "../../utils/ApiError.js";

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = "templates:";

export const createTemplate = async (userId, data) => {
  const template = await Template.create({ ...data, userId });
  await invalidateCache(userId);
  return template;
};

export const getTemplates = async (userId) => {
  const cacheKey = `${CACHE_PREFIX}${userId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const templates = await Template.find({ userId }).sort({ createdAt: -1 });
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(templates));

  return templates;
};

export const getTemplateById = async (userId, templateId) => {
  const cacheKey = `${CACHE_PREFIX}${userId}:${templateId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const template = await Template.findOne({ _id: templateId, userId });
  if (!template) {
    throw ApiError.notFound("Template not found");
  }

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(template));

  return template;
};

export const updateTemplate = async (userId, templateId, data) => {
  const template = await Template.findOneAndUpdate(
    { _id: templateId, userId },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!template) {
    throw ApiError.notFound("Template not found");
  }

  await invalidateCache(userId);

  return template;
};

export const deleteTemplate = async (userId, templateId) => {
  const template = await Template.findOneAndDelete({ _id: templateId, userId });

  if (!template) {
    throw ApiError.notFound("Template not found");
  }

  await invalidateCache(userId);

  return template;
};

export const getTemplateForDispatch = async (templateId) => {
  const template = await Template.findById(templateId);
  if (!template) {
    throw ApiError.notFound("Template not found");
  }
  return template;
};

const invalidateCache = async (userId) => {
  const keys = await redis.keys(`${CACHE_PREFIX}${userId}*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
