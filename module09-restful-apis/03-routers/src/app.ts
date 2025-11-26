import express from "express";
import "#db";
import { userRouter, postRouter } from "#routers";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/users", userRouter);
app.use("/posts", postRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
