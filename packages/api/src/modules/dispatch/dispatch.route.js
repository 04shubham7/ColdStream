import { Router } from "express";
import * as dispatchController from "./dispatch.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { dispatchSchema } from "./dispatch.validation.js";

const router = Router();

router.use(authenticate);

router.post("/dispatch", validate(dispatchSchema), dispatchController.dispatch);
router.get("/status/:jobId", dispatchController.getJobStatus);
router.get("/jobs", dispatchController.getUserJobs);

export default router;
