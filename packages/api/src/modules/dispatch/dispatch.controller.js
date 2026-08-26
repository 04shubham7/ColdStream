import * as dispatchService from "./dispatch.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const dispatch = asyncHandler(async (req, res) => {
  const job = await dispatchService.dispatchEmail(req.user._id, req.body);

  return res
    .status(202)
    .json(ApiResponse.accepted({ jobId: job.jobId }, "Email dispatch queued"));
});

export const getJobStatus = asyncHandler(async (req, res) => {
  const job = await dispatchService.getJobStatus(req.user._id, req.params.jobId);

  return res
    .status(200)
    .json(ApiResponse.ok(job));
});

export const getUserJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await dispatchService.getUserJobs(req.user._id, page, limit);

  return res
    .status(200)
    .json(ApiResponse.ok(result));
});
