import { Router, type RequestHandler } from "express";
import { validateBody } from "#middlewares";
import { postInputSchema, postUpdateInputSchema } from "#schemas";
import {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
} from "#controllers";

const postRouter = Router();

// Custom middleware

const verifyToken: RequestHandler = (req, res, next) => {
  // Token verification logic ...
  req.userId = "69206a5413d1bbc83fd4e98e";
  next();
};

postRouter
  .route("/")
  .get(getAllPosts)
  .post(validateBody(postInputSchema), createPost);

postRouter
  .route("/:id")
  .get(getPostById)
  .put(verifyToken, validateBody(postUpdateInputSchema), updatePost)
  .delete(deletePost);

export default postRouter;
