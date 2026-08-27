import { Router } from "express";
import * as userController from "./user.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.put("/profile", userController.updateProfile);
router.get("/smtp", userController.getSmtpConfig);
router.put("/smtp", userController.updateSmtpConfig);

export default router;
