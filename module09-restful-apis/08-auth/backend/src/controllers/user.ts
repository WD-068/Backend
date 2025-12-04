import type { UserDTO, UserInputDTO } from "#schemas";
import type { RequestHandler } from "express";
import { User } from "#models";

// GET /users
const getAllUsers: RequestHandler<{}, UserDTO[]> = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// POST /users
const createUser: RequestHandler<{}, UserDTO, UserInputDTO> = async (
  req,
  res
) => {
  const newUser = await User.create<UserInputDTO>(req.body);
  res.status(201).json(newUser);
};

// GET /users/:id
const getUserById: RequestHandler<{ id: string }, UserDTO> = async (
  req,
  res
) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) throw new Error("User not found!", { cause: 404 });

  res.json(user);
};

// PUT /users/:id
const updateUser: RequestHandler<
  { id: string },
  UserDTO,
  UserInputDTO
> = async (req, res) => {
  const { id } = req.params;

  const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

  if (!updatedUser) throw new Error("User not found!", { cause: 404 });

  res.json(updatedUser);
};

// DELETE /users/:id
const deleteUser: RequestHandler<{ id: string }, { message: string }> = async (
  req,
  res
) => {
  const { id } = req.params;

  const foundUser = await User.findByIdAndDelete(id);

  if (!foundUser) throw new Error("User not found!", { cause: 404 });

  res.json({ message: "User deleted!" });
};

export { getAllUsers, createUser, getUserById, updateUser, deleteUser };
