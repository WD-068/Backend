import "#db";
import http, {
  type RequestListener,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { Post } from "#models";
import { isValidObjectId } from "mongoose";

type PostType = {
  title: string;
  content: string;
};

const parseJsonBody = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body) as T);
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
};

const createResponse = (
  res: ServerResponse,
  statusCode: number,
  message: unknown
) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  return res.end(
    typeof message === "string"
      ? JSON.stringify({ message })
      : JSON.stringify(message)
  );
};

const requestHandler: RequestListener = async (req, res) => {
  try {
    const singlePostRegex = /^\/posts\/[0-9a-zA-Z]+$/; // Simple expression to match the pattern /posts/anything
    const { method, url } = req;
    if (url === "/posts") {
      if (method === "GET") {
        const posts = await Post.find();
        return createResponse(res, 200, posts);
      }
      if (method === "POST") {
        const body = await parseJsonBody<PostType>(req);
        if (!body.title || !body.content)
          return createResponse(res, 400, "Invalid request body");
        const post = new Post(body);
        await post.save();
        return createResponse(res, 201, post);
      }
      return createResponse(res, 405, "Method Not Allowed");
    }
    if (singlePostRegex.test(url!)) {
      if (method === "GET") {
        const postId = url!.split("/")[2];
        if (!isValidObjectId(postId))
          return createResponse(res, 400, "Invalid Post ID");
        const post = await Post.findById(postId);
        if (!post) return createResponse(res, 404, "Post Not Found");
        return createResponse(res, 200, post);
      }
      if (method === "PUT") {
        const postId = url!.split("/")[2];
        if (!isValidObjectId(postId))
          return createResponse(res, 400, "Invalid Post ID");
        const body = await parseJsonBody<PostType>(req);
        if (!body.title || !body.content)
          return createResponse(res, 400, "Invalid request body");
        const post = await Post.findByIdAndUpdate(postId, body, { new: true });
        if (!post) return createResponse(res, 404, "Post Not Found");
        return createResponse(res, 200, post);
      }
      if (method === "DELETE") {
        const postId = url!.split("/")[2];
        if (!isValidObjectId(postId))
          return createResponse(res, 400, "Invalid Post ID");
        const post = await Post.findByIdAndDelete(postId);
        if (!post) return createResponse(res, 404, "Post Not Found");
        return createResponse(res, 200, { message: "Post Deleted" });
      }
      return createResponse(res, 405, "Method Not Allowed");
    }
    return createResponse(res, 404, "Not Found");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return createResponse(res, 500, { error: error.message });
    }
    return createResponse(res, 500, "Internal Server Error");
  }
};

const server = http.createServer(requestHandler);

const port = 3000;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}/`)
);
