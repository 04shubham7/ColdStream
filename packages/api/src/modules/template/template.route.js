import { Router } from "express";
import * as templateController from "./template.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createTemplateSchema, updateTemplateSchema } from "./template.validation.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(createTemplateSchema), templateController.createTemplate);
router.get("/", templateController.getTemplates);
router.get("/:id", templateController.getTemplateById);
router.patch("/:id", validate(updateTemplateSchema), templateController.updateTemplate);
router.delete("/:id", templateController.deleteTemplate);

export default router;
