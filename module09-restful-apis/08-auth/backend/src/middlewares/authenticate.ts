import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const authenticate: RequestHandler = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new Error('Not authenticated', { cause: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string; role: string };
    console.log(decoded);
    req.user = {
      _id: decoded._id,
      role: decoded.role,
    };
    next();
  } catch {
    throw new Error('Not authenticated', { cause: 401 });
  }
};

export default authenticate;
