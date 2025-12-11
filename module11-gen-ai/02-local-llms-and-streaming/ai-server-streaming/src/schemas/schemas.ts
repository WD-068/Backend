import { isValidObjectId } from "mongoose";
import { z } from "zod/v3";

export const promptSchema = z.object({
  prompt: z
    .string()
    .min(1, "Must have a message")
    .max(1000, "Prompt cannot be longer than 1000 characters"),
  chatId: z
    .string()
    .refine((val) => isValidObjectId(val))
    .nullish(),
  stream: z.boolean().optional().default(false),
});
