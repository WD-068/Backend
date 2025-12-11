import { createChat, createSimpleChat, getChatHistory } from "#controllers";
import { validateBody } from "#middlewares";
import { promptSchema } from "#schemas";
import { Router } from "express";

const chatRouter = Router();

chatRouter.get("/history/:id", getChatHistory);

chatRouter.use(validateBody(promptSchema));
chatRouter.post("/simple-chat", createSimpleChat);
chatRouter.post("/chat", createChat);

export default chatRouter;
