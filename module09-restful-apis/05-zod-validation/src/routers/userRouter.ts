import { Router, type RequestHandler } from "express";
import { validateBody } from "#middlewares";
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

userRouter.route("/").get(getAllUsers).post(validateBody("user"), createUser);

userRouter
  .route("/:id")
  .get(getUserById)
  .put(validateBody("user"), updateUser)
  .delete(deleteUser);

export default userRouter;
