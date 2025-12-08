import type { RequestHandler } from 'express';

const authorize =
  (allowedRoles: string[]): RequestHandler =>
  (req, _res, next) => {
    const { role, _id } = req.user!;

    if (allowedRoles.includes('self')) {
      const { id } = req.params;

      if (id === _id) {
        return next();
      }
    }

    if (allowedRoles.includes(role)) {
      next();
    } else {
      throw new Error('Not allowed', { cause: 403 });
    }
  };

export default authorize;
