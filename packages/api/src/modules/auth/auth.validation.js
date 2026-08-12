import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const oauthCallbackSchema = z.object({
  provider: z.enum(["google"]),
  providerId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
});
