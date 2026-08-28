import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
  }),
});

export const updateSmtpSchema = z.object({
  body: z.object({
    host: z.string().min(1, "Host is required").max(100),
    port: z.number().min(1, "Invalid port").max(65535, "Invalid port"),
    user: z.string().email("Invalid SMTP user email format"),
    pass: z.string().min(1, "SMTP password is required").max(200),
  }),
});
