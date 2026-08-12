import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { signupSchema, loginSchema, oauthCallbackSchema } from "./auth.validation.js";

const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);
router.post("/oauth/callback", validate(oauthCallbackSchema), authController.oauthCallback);

export default router;
