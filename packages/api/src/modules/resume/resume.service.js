import { Resume } from "./resume.model.js";
import { supabase } from "../../config/supabase.js";
import { ApiError } from "../../utils/ApiError.js";

const BUCKET_NAME = "resumes";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["application/pdf"];

export const uploadResume = async (userId, file, name) => {
  if (!file) {
    throw ApiError.badRequest("No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw ApiError.badRequest("File size must be less than 5MB");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw ApiError.badRequest("Only PDF files are allowed");
  }

  const fileExt = file.originalname.split(".").pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw ApiError.internal("Failed to upload file to storage");
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const resume = await Resume.create({
    userId,
    name,
    fileName: file.originalname,
    fileUrl: urlData.publicUrl,
    fileSize: file.size,
    mimeType: file.mimetype,
    supabasePath: filePath,
  });

  return resume;
};

export const getResumes = async (userId) => {
  const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
  return resumes;
};

export const getResumeById = async (userId, resumeId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    throw ApiError.notFound("Resume not found");
  }
  return resume;
};

export const deleteResume = async (userId, resumeId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    throw ApiError.notFound("Resume not found");
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([resume.supabasePath]);

  if (error) {
    throw ApiError.internal("Failed to delete file from storage");
  }

  await Resume.findByIdAndDelete(resumeId);

  return resume;
};

export const getResumeForDispatch = async (resumeId) => {
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw ApiError.notFound("Resume not found");
  }
  return resume;
};
