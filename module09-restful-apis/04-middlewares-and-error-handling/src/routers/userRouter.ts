import { Router, type RequestHandler } from "express";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from "#controllers";

const userRouter = Router();

// Route-level middleware

// const userMiddleware: RequestHandler = (req, res, next) => {
//   console.log("Only appears on the user routes");
//   next();
// };

// userRouter.use(userMiddleware);

// Method specific middleware

// const validateUser: RequestHandler = (req, res, next) => {
//   // Body validation logic ...
//   console.log("Validation passed");
//   next();
// };

userRouter.route("/").get(getAllUsers).post(createUser);

userRouter.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

export default userRouter;
