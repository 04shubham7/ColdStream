import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { connectDB } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.route.js";
import templateRoutes from "./modules/template/template.route.js";
import resumeRoutes from "./modules/resume/resume.route.js";
import dispatchRoutes from "./modules/dispatch/dispatch.route.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/templates", templateRoutes);
app.use("/api/v1/resumes", resumeRoutes);
app.use("/api/v1/mail", dispatchRoutes);

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`API Gateway running on port ${env.PORT}`);
  });
};

startServer();

export default app;
