import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    title: { type: String, required: true, maxLength: 255 },
    content: { type: String, required: true, maxLength: 1000 },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default model("Post", postSchema);
