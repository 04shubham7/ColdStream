import * as templateService from "./template.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const createTemplate = asyncHandler(async (req, res) => {
  const template = await templateService.createTemplate(req.user._id, req.body);

  return res
    .status(201)
    .json(ApiResponse.created(template, "Template created"));
});

export const getTemplates = asyncHandler(async (req, res) => {
  const templates = await templateService.getTemplates(req.user._id);

  return res
    .status(200)
    .json(ApiResponse.ok(templates));
});

export const getTemplateById = asyncHandler(async (req, res) => {
  const template = await templateService.getTemplateById(
    req.user._id,
    req.params.id
  );

  return res
    .status(200)
    .json(ApiResponse.ok(template));
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const template = await templateService.updateTemplate(
    req.user._id,
    req.params.id,
    req.body
  );

  return res
    .status(200)
    .json(ApiResponse.ok(template, "Template updated"));
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  await templateService.deleteTemplate(req.user._id, req.params.id);

  return res
    .status(200)
    .json(ApiResponse.ok(null, "Template deleted"));
});
