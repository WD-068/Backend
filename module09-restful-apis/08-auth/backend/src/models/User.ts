import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, maxLength: 100 },
    lastName: { type: String, required: true, maxLength: 100 },
    email: { type: String, required: true, unique: true },
    password: { type: String, require: true, select: false }, // for storing password hash
    role: { type: String, default: 'reader', enum: ['reader', 'admin', 'author'] },
  },
  { timestamps: true }
);

export default model('User', userSchema);
