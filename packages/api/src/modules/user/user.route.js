import { Router } from "express";
import * as userController from "./user.controller.js";
import { protect } from "../../middleware/auth.js";

const router = Router();

router.use(protect);

router.put("/profile", userController.updateProfile);
router.get("/smtp", userController.getSmtpConfig);
router.put("/smtp", userController.updateSmtpConfig);

export default router;
