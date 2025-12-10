import { Chat } from "#models";
import { promptSchema } from "#schemas";
import type { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import type { z } from "zod/v3";

type IncomingPrompt = z.infer<typeof promptSchema>;
type ChatResponse = {
  completion: string;
};
type ChatResponseWithId = ChatResponse & {
  chatId: string;
};

const messages: ChatCompletionMessageParam[] = [
  { role: "developer", content: "You are a pirate that knows web development" },
];

const createSimpleChat: RequestHandler<
  {},
  ChatResponse,
  IncomingPrompt
> = async (req, res) => {
  const { prompt } = req.body;

  const client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env?.AI_BASE_URL,
  });

  messages.push({ role: "user", content: prompt });

  const completion = await client.chat.completions.create({
    model: process.env.AI_MODEL || "gemini-2.0-flash",
    messages,
  });

  console.log(completion);

  const completionText =
    completion.choices[0]?.message.content || "No completion generated";

  messages.push({ role: "assistant", content: completionText });

  res.json({ completion: completionText });
};

const createChat: RequestHandler<
  {},
  ChatResponseWithId,
  IncomingPrompt
> = async (req, res) => {
  const { prompt, chatId } = req.body;

  // Search for the chat in the database
  let currentChat = await Chat.findById(chatId);

  // Create a new chat if no chat was found
  if (!currentChat) {
    const systemPrompt = {
      role: "developer",
      content: "You are a helpful assistant",
    };
    currentChat = await Chat.create({
      history: [systemPrompt],
    });
  }

  // Add the user message to the chat history
  currentChat.history.push({
    role: "user",
    content: prompt,
  });

  const client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env?.AI_BASE_URL,
  });

  console.log(currentChat.history);

  const completion = await client.chat.completions.create({
    model: process.env.AI_MODEL || "gemini-2.0-flash",
    // Stringify and parse to remove mongoose types
    messages: JSON.parse(JSON.stringify(currentChat.history)),
  });

  const completionText =
    completion.choices[0]?.message.content || "No completion generated";

  currentChat.history.push({ role: "assistant", content: completionText });

  await currentChat.save();

  res.json({ completion: completionText, chatId: currentChat._id.toString() });
};

const getChatHistory: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error("Invalid id", { cause: 400 });

  const chat = await Chat.findById(id);

  if (!chat) throw new Error("Chat not found", { cause: 404 });

  res.json(chat);
};

export { createChat, createSimpleChat, getChatHistory };
