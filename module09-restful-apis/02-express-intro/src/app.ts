import express from "express";
import "#db";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from "#controllers";

const app = express();
const port = 3000;

app.use(express.json());

app.route("/users").get(getAllUsers).post(createUser);

app.route("/users/:id").get(getUserById).put(updateUser).delete(deleteUser);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
