import { Router } from "express";
import * as userController from "./user.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { updateProfileSchema, updateSmtpSchema } from "./user.schema.js";

const router = Router();

router.use(authenticate);

router.put("/profile", validate(updateProfileSchema), userController.updateProfile);
router.get("/smtp", userController.getSmtpConfig);
router.put("/smtp", validate(updateSmtpSchema), userController.updateSmtpConfig);

export default router;
