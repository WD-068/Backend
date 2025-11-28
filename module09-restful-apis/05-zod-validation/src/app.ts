import express from "express";
import "#db";
import { userRouter, postRouter } from "#routers";
import { errorHandler } from "#middlewares";

const app = express();
const port = 3000;

app.use(express.json());

// Application-level middleware

// app.use((req, res, next) => {
//   console.log("Time: ", Date.now());
//   next();
// });

app.use("/users", userRouter);
app.use("/posts", postRouter);

app.use("*splat", (req, res) => {
  throw new Error("Not found", { cause: 404 });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
