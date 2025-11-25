import type { RequestHandler } from "express";
import { User } from "#models";
import { isValidObjectId } from "mongoose";

type UserType = {
  firstName: string;
  lastName: string;
  email: string;
};

const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

const createUser: RequestHandler<{}, {}, UserType> = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(400)
        .json({ error: "FirstName, LastName and Email are required!" });

    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return res
        .status(400)
        .json({ error: "FirstName, LastName and Email are required!" });
    }

    const newUser = await User.create<UserType>({ firstName, lastName, email });

    res.json(newUser);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

const getUserById: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid ID" });

    const user = await User.findById(id);

    if (!user) return res.status(404).json({ error: "User not found!" });

    res.json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

const updateUser: RequestHandler<{ id: string }, {}, UserType> = async (
  req,
  res
) => {
  try {
    if (!req.body)
      return res
        .status(400)
        .json({ error: "FirstName, LastName and Email are required!" });

    const { firstName, lastName, email } = req.body;
    const { id } = req.params;

    if (!firstName || !lastName || !email) {
      return res
        .status(400)
        .json({ error: "FirstName, LastName and Email are required!" });
    }

    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid ID" });

    const user = await User.findByIdAndUpdate<UserType>(
      id,
      {
        firstName,
        lastName,
        email,
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found!" });

    res.json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid ID" });

    const foundUser = await User.findByIdAndDelete(id);

    if (!foundUser) return res.status(404).json({ error: "User not found!" });

    res.json({ message: "User deleted!" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export { getAllUsers, createUser, getUserById, updateUser, deleteUser };
