import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, maxLength: 100 },
    lastName: { type: String, required: true, maxLength: 100 },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default model("User", userSchema);
