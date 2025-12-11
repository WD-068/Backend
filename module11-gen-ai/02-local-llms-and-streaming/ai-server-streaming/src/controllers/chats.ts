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
  const { prompt, chatId, stream } = req.body;

  let currentChat = await Chat.findById(chatId);

  if (!currentChat) {
    const systemPrompt = {
      role: "developer",
      content: "You are a helpful assistant",
    };
    currentChat = await Chat.create({
      history: [systemPrompt],
    });
  }

  currentChat.history.push({
    role: "user",
    content: prompt,
  });

  const client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env?.AI_BASE_URL,
  });

  if (stream) {
    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gemini-2.0-flash",
      messages: JSON.parse(JSON.stringify(currentChat.history)),
      stream,
    });

    res.writeHead(200, {
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    });

    let fullResponse = "";

    for await (const chunk of completion) {
      const chunkText = chunk.choices[0]?.delta?.content;
      // console.log(chunkText);
      // console.log("_".repeat(80));
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
      fullResponse += chunkText;
    }

    currentChat.history.push({ role: "assistant", content: fullResponse });

    res.write(`data: ${JSON.stringify({ chatId: currentChat._id })}\n\n`);

    // console.log(fullResponse);

    res.end();

    res.on("close", async () => {
      await currentChat.save();
      res.end();
    });
  } else {
    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gemini-2.0-flash",
      messages: JSON.parse(JSON.stringify(currentChat.history)),
    });

    const completionText =
      completion.choices[0]?.message.content || "No completion generated";

    currentChat.history.push({ role: "assistant", content: completionText });

    await currentChat.save();

    res.json({
      completion: completionText,
      chatId: currentChat._id.toString(),
    });
  }
};

const getChatHistory: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error("Invalid id", { cause: 400 });

  const chat = await Chat.findById(id);

  if (!chat) throw new Error("Chat not found", { cause: 404 });

  res.json(chat);
};

export { createChat, createSimpleChat, getChatHistory };
