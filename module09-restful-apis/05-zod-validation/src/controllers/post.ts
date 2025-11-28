import type { z } from "zod/v4";
import type {
  postInputSchema,
  postUpdateInputSchema,
  postSchema,
} from "#schemas";
import type { RequestHandler } from "express";
import { Post } from "#models";

type PostInputDTO = z.infer<typeof postInputSchema>;

type UpdatePostDTO = z.infer<typeof postUpdateInputSchema>;

type PostDTO = z.infer<typeof postSchema>;

const getAllPosts: RequestHandler<{}, PostDTO[]> = async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
};

const createPost: RequestHandler<{}, PostDTO, PostInputDTO> = async (
  req,
  res
) => {
  const { title, content, owner } = req.body;

  const newPost = await Post.create<PostInputDTO>({ title, content, owner });
  res.status(201).json(newPost);
};

const getPostById: RequestHandler<{ id: string }, PostDTO> = async (
  req,
  res
) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) throw new Error("Post not found!", { cause: 404 });

  res.json(post);
};

const updatePost: RequestHandler<
  { id: string },
  PostDTO,
  UpdatePostDTO
> = async (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  const { userId } = req;

  const post = await Post.findById(id);

  if (!post) throw new Error("Post not found!", { cause: 404 });

  if (userId !== post.owner.toString())
    throw new Error("You are not authorized to update this post", {
      cause: 403,
    });

  post.title = title;
  post.content = content;

  await post.save();
  res.json(post);
};

const deletePost: RequestHandler<{ id: string }, { message: string }> = async (
  req,
  res
) => {
  const { id } = req.params;

  const foundPost = await Post.findByIdAndDelete(id);

  if (!foundPost) throw new Error("Post not found!", { cause: 404 });

  res.json({ message: "Post deleted!" });
};

export { getAllPosts, createPost, getPostById, updatePost, deletePost };
