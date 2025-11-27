import type { RequestHandler } from "express";
import { Post } from "#models";
import { isValidObjectId } from "mongoose";

type PostType = {
  title: string;
  content: string;
  owner: string;
};

type UpdatePostType = Omit<PostType, "owner">;

const getAllPosts: RequestHandler = async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
};

const createPost: RequestHandler<{}, {}, PostType> = async (req, res) => {
  if (!req.body)
    throw new Error("Title and content are required!", {
      cause: 400,
    });

  const { title, content, owner } = req.body;

  if (!title || !content || !owner)
    throw new Error("Title, content & owner are required!", {
      cause: 400,
    });

  const newPost = await Post.create<PostType>({ title, content, owner });

  res.json(newPost);
};

const getPostById: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error("Invalid ID", { cause: 400 });

  const post = await Post.findById(id);

  if (!post) throw new Error("Post not found!", { cause: 404 });

  res.json(post);
};

const updatePost: RequestHandler<{ id: string }, {}, UpdatePostType> = async (
  req,
  res
) => {
  if (!req.body)
    throw new Error("Title and content are required!", {
      cause: 400,
    });

  const { title, content } = req.body;
  const { id } = req.params;
  const { userId } = req;

  if (!title || !content)
    throw new Error("Title and content are required!", {
      cause: 400,
    });

  if (!isValidObjectId(id)) throw new Error("Invalid ID", { cause: 400 });

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

const deletePost: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error("Invalid ID", { cause: 400 });

  const foundPost = await Post.findByIdAndDelete(id);

  if (!foundPost) throw new Error("Post not found!", { cause: 404 });

  res.json({ message: "Post deleted!" });
};

export { getAllPosts, createPost, getPostById, updatePost, deletePost };
