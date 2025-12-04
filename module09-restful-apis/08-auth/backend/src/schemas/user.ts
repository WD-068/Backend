import { z } from "zod/v4";
import { isValidObjectId, Types } from "mongoose";

// --- Base Schemas (Internal/External) ---
const dbEntrySchema = z.strictObject({
  _id: z.instanceof(Types.ObjectId),
  createdAt: z.date(),
  updatedAt: z.date(),
  __v: z.int().nonnegative(),
});

export const userParamsSchema = z.object({
  id: z
    .string()
    .refine((val) => isValidObjectId(val), "Invalid user ID format!"),
});

export const userInputSchema = z.strictObject({
  firstName: z
    .string()
    .min(1, "First name can't be empty!")
    .max(100, "First name can't be longer than 100 characters!"),
  lastName: z
    .string()
    .min(1, "Last name can't be empty!")
    .max(100, "Last name can't be longer than 100 characters!"),
  email: z.string().email("Invalid email format!"),
});

// --- Output/DTO Schemas ---
export const userSchema = z.object({
  ...dbEntrySchema.shape,
  ...userInputSchema.shape,
});

// --- Derived Types (DTOs) ---
export type UserParamsDTO = z.infer<typeof userParamsSchema>;
export type UserInputDTO = z.infer<typeof userInputSchema>;
export type UserDTO = z.infer<typeof userSchema>;
