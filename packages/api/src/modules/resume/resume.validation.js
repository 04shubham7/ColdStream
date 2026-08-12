import { z } from "zod";

export const uploadResumeSchema = z.object({
  name: z.string().min(1).max(100),
});
