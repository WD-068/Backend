import type { RequestHandler } from "express";
import { Post } from "#models";
import { isValidObjectId } from "mongoose";

type PostType = {
  title: string;
  content: string;
  owner: string;
};

const getAllPosts: RequestHandler = async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

const createPost: RequestHandler<{}, {}, PostType> = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(400)
        .json({ error: "FirstName, LastName and Email are required!" });

    const { title, content, owner } = req.body;

    if (!title || !content || !owner) {
      return res
        .status(400)
        .json({ error: "FirstName, LastName and Email are required!" });
    }

    const newPost = await Post.create<PostType>({ title, content, owner });

    res.json(newPost);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

const getPostById: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid ID" });

    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ error: "Post not found!" });

    res.json(post);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

const updatePost: RequestHandler<{ id: string }, {}, PostType> = async (
  req,
  res
) => {
  try {
    if (!req.body)
      return res
        .status(400)
        .json({ error: "FirstName, LastName and Email are required!" });

    const { title, content, owner } = req.body;
    const { id } = req.params;

    if (!title || !content || !owner) {
      return res
        .status(400)
        .json({ error: "FirstName, LastName and Email are required!" });
    }

    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid ID" });

    const post = await Post.findByIdAndUpdate<PostType>(
      id,
      {
        title,
        content,
        owner,
      },
      { new: true }
    );

    if (!post) return res.status(404).json({ error: "Post not found!" });

    res.json(post);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

const deletePost: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid ID" });

    const foundPost = await Post.findByIdAndDelete(id);

    if (!foundPost) return res.status(404).json({ error: "Post not found!" });

    res.json({ message: "Post deleted!" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export { getAllPosts, createPost, getPostById, updatePost, deletePost };
