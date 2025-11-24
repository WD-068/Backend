import "#db";
import { User, Post } from "#models";

type UserType = {
  firstName: string;
  lastName: string;
  email: string;
};

try {
  // ----- Create -----
  //   # Option 1
  //   const newUser = new User({
  //     firstName: "John",
  //     lastName: "Doe",
  //     email: "john@doe.com",
  //   });
  //   await newUser.save();
  //   console.log(newUser);
  // # Option 2 (default)
  //   const newUser = await User.create({
  //     firstName: "Jane",
  //     lastName: "Doe",
  //     email: "jane@doe.com",
  //   });
  //   console.log(newUser);
  //  ----- Read -----
  //   const users = await User.find();
  //   console.log(users);
  //   const userJohn = await User.find({ firstName: "John" });
  //   console.log(userJohn);
  //   const firstDoe = await User.findOne({ lastName: "Doe" });
  //   console.log(firstDoe);
  //   const user = await User.findById("69206a5413d1bbc83fd4e98e");
  //   console.log(user);
  //  ----- Update -----
  //   const updateJohn = await User.findByIdAndUpdate(
  //     "69206933d909696b2e4c63d1",
  //     {
  //       firstName: "John",
  //       lastName: "Doe",
  //       email: "johnjohn@doe.com",
  //     },
  //     { new: true }
  //   );
  //   console.log(updateJohn);
  // ----- Delete -----
  //   await User.findByIdAndDelete("69206933d909696b2e4c63d1");
  //   console.log("User deleted");
  //   ----- Data Modelling -----
  //   # New User
  //   const newUser = await User.create({
  //     firstName: "John",
  //     lastName: "Doe",
  //     email: "john@doe.com",
  //   });
  //   console.log(newUser);
  //   # New Post
  //   const newPost = await Post.create({
  //     title: "Hello",
  //     content: "This is a post!",
  //     owner: "69206a5413d1bbc83fd4e98e",
  //   });
  //   console.log(newPost);
  //   # Query with populate
  //   const posts = await Post.find().populate("owner", "firstName lastName email");
  //   console.log(posts);
  //    ----- TypeScript ? -----
  //   const newUser = await User.create<UserType>({
  //     firstName: "John",
  //     lastName: "Doe",
  //     email: "john@doe.com",
  //   });
  //   console.log(newUser);
} catch (error) {
  console.error(error);
}
