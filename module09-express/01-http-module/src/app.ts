import "#db";
import http, {
  type RequestListener,
  type ServerResponse,
  type IncomingMessage,
} from "node:http";
import { User, Post } from "#models";

type UserType = {
  firstName: string;
  lastName: string;
  email: string;
};

const parsedJsonBody = <T>(req: IncomingMessage): Promise<T> => {
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
  const singlePostRegex = /^\/users\/[0-9a-zA-Z]+$/; // Simple expression to match the pattern /users/anything
  const { method, url } = req;
  console.log(method, url);

  if (url === "/users") {
    if (method === "GET") {
      const users = await User.find();
      // console.log(users);
      return createResponse(res, 200, users);
    }
    if (method === "POST") {
      const body = await parsedJsonBody<UserType>(req);
      const newUser = await User.create(body);
      return createResponse(res, 201, newUser);
    }

    return createResponse(res, 405, "Method not allowed");
  }

  if (singlePostRegex.test(url!)) {
    if (method === "GET") {
      return createResponse(res, 200, `GET request on ${url}`);
    }
    if (method === "PUT") {
      return createResponse(res, 201, `PUT request on ${url}`);
    }
    if (method === "DELETE") {
      return createResponse(res, 200, `DELETE request on ${url}`);
    }
    return createResponse(res, 405, "Method Not Allowed");
  }

  return createResponse(res, 404, "Not found");
};

const server = http.createServer(requestHandler);

const port = 3000;

server.listen(port, () =>
  console.log(`Server is running at http://localhost:${port}/`)
);

// _______________________________________________________________________________________

// try {
//   // ----- Create -----
//   //   # Option 1
//   //   const newUser = new User({
//   //     firstName: "John",
//   //     lastName: "Doe",
//   //     email: "john@doe.com",
//   //   });
//   //   await newUser.save();
//   //   console.log(newUser);
//   // # Option 2 (default)
//   //   const newUser = await User.create({
//   //     firstName: "Jane",
//   //     lastName: "Doe",
//   //     email: "jane@doe.com",
//   //   });
//   //   console.log(newUser);
//   //  ----- Read -----
//   //   const users = await User.find();
//   //   console.log(users);
//   //   const userJohn = await User.find({ firstName: "John" });
//   //   console.log(userJohn);
//   //   const firstDoe = await User.findOne({ lastName: "Doe" });
//   //   console.log(firstDoe);
//   //   const user = await User.findById("69206a5413d1bbc83fd4e98e");
//   //   console.log(user);
//   //  ----- Update -----
//   //   const updateJohn = await User.findByIdAndUpdate(
//   //     "69206933d909696b2e4c63d1",
//   //     {
//   //       firstName: "John",
//   //       lastName: "Doe",
//   //       email: "johnjohn@doe.com",
//   //     },
//   //     { new: true }
//   //   );
//   //   console.log(updateJohn);
//   // ----- Delete -----
//   //   await User.findByIdAndDelete("69206933d909696b2e4c63d1");
//   //   console.log("User deleted");
//   //   ----- Data Modelling -----
//   //   # New User
//   //   const newUser = await User.create({
//   //     firstName: "John",
//   //     lastName: "Doe",
//   //     email: "john@doe.com",
//   //   });
//   //   console.log(newUser);
//   //   # New Post
//   //   const newPost = await Post.create({
//   //     title: "Hello",
//   //     content: "This is a post!",
//   //     owner: "69206a5413d1bbc83fd4e98e",
//   //   });
//   //   console.log(newPost);
//   //   # Query with populate
//   //   const posts = await Post.find().populate("owner", "firstName lastName email");
//   //   console.log(posts);
//   //    ----- TypeScript ? -----
//   //   const newUser = await User.create<UserType>({
//   //     firstName: "John",
//   //     lastName: "Doe",
//   //     email: "john@doe.com",
//   //   });
//   //   console.log(newUser);
// } catch (error) {
//   console.error(error);
// }
