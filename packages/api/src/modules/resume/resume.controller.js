import * as resumeService from "./resume.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const uploadResume = async (req, res) => {
  const resume = await resumeService.uploadResume(
    req.user._id,
    req.file,
    req.body.name
  );

  return res
    .status(201)
    .json(ApiResponse.created(resume, "Resume uploaded"));
};

export const getResumes = async (req, res) => {
  const resumes = await resumeService.getResumes(req.user._id);

  return res
    .status(200)
    .json(ApiResponse.ok(resumes));
};

export const getResumeById = async (req, res) => {
  const resume = await resumeService.getResumeById(
    req.user._id,
    req.params.id
  );

  return res
    .status(200)
    .json(ApiResponse.ok(resume));
};

export const deleteResume = async (req, res) => {
  await resumeService.deleteResume(req.user._id, req.params.id);

  return res
    .status(200)
    .json(ApiResponse.ok(null, "Resume deleted"));
};
