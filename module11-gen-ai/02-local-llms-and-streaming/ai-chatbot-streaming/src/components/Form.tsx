import {
  useState,
  type ChangeEventHandler,
  type FormEventHandler,
} from "react";
import { toast } from "react-toastify";
import type { Message, SetMessages, SetChatId } from "../types";
import { createChat, fetchChat } from "../data/ai";

type FormProps = {
  setMessages: SetMessages;
  chatId: string | null;
  setChatId: SetChatId;
};

const Form = ({ setMessages, setChatId, chatId }: FormProps) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStream, setIsStream] = useState(false);

  const toggleChecked = () => setIsStream((prev) => !prev);

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) =>
    setPrompt(e.target.value);

  const handleSubmit: FormEventHandler = async (e) => {
    try {
      e.preventDefault();

      if (!prompt) throw new Error("Please enter a prompt");

      setLoading(true);

      const userMsg: Message = {
        role: "user",
        content: prompt,
        _id: crypto.randomUUID(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const asstMsg: Message = {
        role: "assistant",
        content: "",
        _id: crypto.randomUUID(),
      };

      if (isStream) {
        const res = await fetchChat({ prompt, chatId, stream: isStream });
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // console.log(chunk);

          const lines = chunk.split("\n");
          // console.log("lines: ", lines);

          const dataLines = lines.filter((line) => line.startsWith("data:"));

          dataLines.forEach((line) => {
            // Get the JSON string without the data: prefix
            const jsonStr = line.replace("data:", "");
            const data = JSON.parse(jsonStr);
            // console.log(data);

            // Check if data has chatId property
            if (data.chatId) {
              // If so update localStorage and set ChatId state
              localStorage.setItem("chatId", data.chatId);
              setChatId(data.chatId);
              // Else check if data has text property
            } else if (data.text) {
              // Update message state
              setMessages((prev) => {
                // Check if the message already exists
                const msgExists = prev.some((msg) => msg._id === asstMsg._id);
                let updatedState: Message[] = [];
                // If it does exist add the latest/newest chunk of text
                if (msgExists) {
                  // Add the newest text chunk
                  updatedState = prev.map((msg) =>
                    msg._id === asstMsg._id
                      ? { ...msg, content: msg.content + data.text }
                      : msg
                  );
                } else {
                  // Otherwise create a new message and add it to the end of the messages array
                  asstMsg.content = data.text;
                  updatedState = [...prev, asstMsg];
                }
                return updatedState;
              });
            }
          });
        }
      } else {
        const response = await createChat({
          prompt,
          chatId,
          stream: isStream,
        });

        asstMsg.content = response.completion;

        setMessages((prev) => [...prev, asstMsg]);

        localStorage.setItem("chatId", response.chatId);

        setChatId(response.chatId);

        setPrompt("");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send message");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-1/3 w-full p-8 bg-slate-600 rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <label className="flex gap-2 items-center my-2">
          <input
            id="stream"
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={isStream}
            onChange={toggleChecked}
            disabled={loading}
          />
          <span>Stream response?</span>
        </label>
        <textarea
          value={prompt}
          onChange={handleChange}
          id="prompt"
          rows={5}
          placeholder="Ask me anything..."
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
        <button
          id="submit"
          type="submit"
          className="mt-4 w-full btn btn-primary"
          disabled={loading}
        >
          Submit✨
        </button>
      </form>
    </div>
  );
};

export default Form;
