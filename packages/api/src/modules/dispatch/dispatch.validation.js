import { z } from "zod";

export const dispatchSchema = z.object({
  recruiterEmail: z.string().email(),
  templateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  resumeId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  variables: z.record(z.string()).optional(),
});
