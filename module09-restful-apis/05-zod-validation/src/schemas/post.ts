import { isValidObjectId, Types } from "mongoose";
import { z } from "zod/v4";

const dbEntrySchema = z.strictObject({
  _id: z.instanceof(Types.ObjectId),
  createdAt: z.date(),
  updatedAt: z.date(),
  __v: z.int().nonnegative(),
});

const postInputSchema = z.strictObject({
  title: z
    .string()
    .min(1, "Your post must have a name!")
    .max(255, "Maximum title length is 255 characters!"),
  content: z
    .string()
    .min(1, "Your text cannot be empty!")
    .max(1000, "Maximum text length is 1000 characters!"),
  owner: z.string().refine((val) => isValidObjectId(val), "Invalid owner ID"),
});

const postUpdateInputSchema = postInputSchema.omit({ owner: true });

const postSchema = z.object({
  ...dbEntrySchema.shape,
  ...postInputSchema.shape,
  owner: z.instanceof(Types.ObjectId),
});

export { postInputSchema, postUpdateInputSchema, postSchema };
