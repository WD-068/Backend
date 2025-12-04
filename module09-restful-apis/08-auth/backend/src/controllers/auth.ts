import { User } from '#models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { CookieOptions, RequestHandler } from 'express';

const TOKEN_TTL = Number(process.env.TOKEN_TTL!) * 24 * 60 * 60;

const tokenCookieOpt = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  expires: new Date(Date.now() + TOKEN_TTL * 1000), // 7 days
} satisfies CookieOptions;

export const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  // 1. Check if User already exists

  const emailInUse = await User.exists({ email });
  if (emailInUse) {
    throw new Error('Email in use', { cause: 409 }); // 409 - Conflict
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(13);
  const hashedPW = await bcrypt.hash(password, salt);

  // 3. Save the new user
  const user = await User.create({ ...req.body, password: hashedPW });
  if (!user) {
    throw new Error('Error during registration', { cause: 500 });
  }

  // 4. Either cookie, or go to login
  res.json({ message: 'Registration successful. Please go to the Login' });
};

export const login: RequestHandler = async (req, res) => {
  // 1. Find user in DB
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials', { cause: 401 });
  }
  // 2. Compare passwords
  const match = await bcrypt.compare(password, user.password!);
  if (!match) {
    throw new Error('Invalid credentials', { cause: 401 });
  }
  // 3. JWT - "passport"

  const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: TOKEN_TTL });

  // 4. Put jwt in cookie

  res.cookie('token', token, tokenCookieOpt);

  res.json({ message: 'Logged in!' });
};

export const logout: RequestHandler = async (req, res) => {
  res.clearCookie('token', tokenCookieOpt);
  res.json({ message: 'Bye' });
};

export const me: RequestHandler = async (req, res) => {
  const { _id } = req.user!;
  const user = await User.findById(_id);
  if (!user) throw new Error('User not found', { cause: 404 });
  res.json({ user });
};
