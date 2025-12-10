import { z } from "zod/v3";

export const promptSchema = z.object({
  prompt: z.string().min(1, "Must have a message"),
  // nullish makes it both optional, and allows null as a value
  chatId: z.string().length(24).nullish(),
});
