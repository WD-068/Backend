import type { RequestHandler } from "express";
import { User } from "#models";
import { isValidObjectId } from "mongoose";

type UserType = {
  firstName: string;
  lastName: string;
  email: string;
};

const getAllUsers: RequestHandler = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

const createUser: RequestHandler<{}, {}, UserType> = async (req, res) => {
  if (!req.body)
    throw new Error("FirstName, LastName and Email are required!", {
      cause: 400,
    });

  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email)
    throw new Error("FirstName, LastName and Email are required!", {
      cause: 400,
    });

  const newUser = await User.create<UserType>({ firstName, lastName, email });

  res.json(newUser);
};

const getUserById: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error("Invalid ID", { cause: 400 });

  const user = await User.findById(id);

  if (!user) throw new Error("User not found!", { cause: 404 });

  res.json(user);
};

const updateUser: RequestHandler<{ id: string }, {}, UserType> = async (
  req,
  res
) => {
  if (!req.body)
    throw new Error("FirstName, LastName and Email are required!", {
      cause: 400,
    });

  const { firstName, lastName, email } = req.body;
  const { id } = req.params;

  if (!firstName || !lastName || !email)
    throw new Error("FirstName, LastName and Email are required!", {
      cause: 400,
    });

  if (!isValidObjectId(id)) throw new Error("Invalid ID", { cause: 400 });

  const user = await User.findByIdAndUpdate<UserType>(
    id,
    {
      firstName,
      lastName,
      email,
    },
    { new: true }
  );

  if (!user) throw new Error("User not found!", { cause: 404 });

  res.json(user);
};

const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error("Invalid ID", { cause: 400 });

  const foundUser = await User.findByIdAndDelete(id);

  if (!foundUser) throw new Error("User not found!", { cause: 404 });

  res.json({ message: "User deleted!" });
};

export { getAllUsers, createUser, getUserById, updateUser, deleteUser };
