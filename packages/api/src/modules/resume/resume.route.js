import { Router } from "express";
import multer from "multer";
import * as resumeController from "./resume.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { uploadResumeSchema } from "./resume.validation.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

const router = Router();

router.use(authenticate);

router.post(
  "/upload",
  upload.single("resume"),
  validate(uploadResumeSchema),
  resumeController.uploadResume
);
router.get("/", resumeController.getResumes);
router.get("/:id", resumeController.getResumeById);
router.delete("/:id", resumeController.deleteResume);

export default router;
