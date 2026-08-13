import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { signupSchema, loginSchema, oauthCallbackSchema } from "./auth.validation.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

router.post("/signup", validate(signupSchema), asyncHandler(authController.signup));
router.post("/login", validate(loginSchema), asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", authenticate, asyncHandler(authController.logout));
router.get("/me", authenticate, asyncHandler(authController.getMe));
router.post("/oauth/callback", validate(oauthCallbackSchema), asyncHandler(authController.oauthCallback));

export default router;
