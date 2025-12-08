import type { RequestHandler } from "express";
import { z, type ZodObject } from "zod/v4";
import type { ParamsDictionary } from "express-serve-static-core";

export const validateBody =
  (zodSchema: ZodObject): RequestHandler =>
  (req, res, next) => {
    const { data, error, success } = zodSchema.safeParse(req.body);

    if (!success) {
      next(new Error(z.prettifyError(error), { cause: 400 }));
    } else {
      req.body = data;
      next();
    }
  };

export const validateParams =
  (zodSchema: ZodObject): RequestHandler =>
  (req, res, next) => {
    const { data, error, success } = zodSchema.safeParse(req.params);

    if (!success) {
      next(new Error(z.prettifyError(error), { cause: 400 }));
    } else {
      req.params = data as ParamsDictionary;
      next();
    }
  };
