import { Router, type RequestHandler } from "express";
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

postRouter.route("/").get(getAllPosts).post(createPost);

postRouter
  .route("/:id")
  .get(getPostById)
  .put(verifyToken, updatePost)
  .delete(deletePost);

export default postRouter;
