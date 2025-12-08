# Backend API Starter Kit (Node.js + TypeScript)

A modern, modular backend starter template using Node.js (Native ESM), Express 5, Mongoose, and Zod.

## Features

- **Express 5**: Native support for asynchronous route handlers (no more `try/catch` blocks in controllers!).
- **Native Path Aliases**: Using Node.js Subpath Imports (`#models`, `#controllers`) for clean imports.
- **Zod Validation**: Strict schema validation for incoming data.
- **Modular Architecture**: Clear separation of concerns (Routers, Controllers, Services/Models).
- **TypeScript**: configured for modern Node environments.

## Project Structure

The project is organized by modules to keep code clean and scalable.

```text
src/
├── app.ts                  # Entry point (App assembly)
├── controllers/            # Request logic (req -> res)
├── db/                     # Database connection logic
├── middlewares/            # Error handling, Validation, Auth
├── models/                 # Mongoose Data Models
├── routers/                # Route definitions
├── schemas/                # Zod Validation Schemas & TypeScript Interfaces
└── utils/                  # Helper functions
```

## Prerequisites

Node.js: Version v20.6.0 or higher is required (for native .env file support and --watch flags).

MongoDB: A running instance of MongoDB (local or Atlas).

## Installation

Clone the repository:

```
git clone <repo-url>
cd <repo-name>

Install dependencies:
```

```
npm install
```

Environment Setup
Create a file named .env.development.local in the root directory:

```
MONGO_URI=mongodb://localhost:27017/my_database_name
PORT=3000
```

## Running the Project

Development Mode
Runs the server with hot-reloading using Node's native watch mode.

```
npm run dev
```

Production Build
Compiles TypeScript to JavaScript (into dist/) and runs the optimized code.

```
npm run build
npm start
```

## How to Add a New Feature (e.g., "Users")

We follow a Data-First approach to avoid rewriting code.

- **Model** (src/models/User.ts): Define the Mongoose Schema for the database.

- **Schema** (src/schemas/user.ts): Define the Zod schema for validation AND export the TypeScript types (using z.infer).

- **Controller** (src/controllers/user.ts): Write the functions to handle requests (getAll, create, etc.). Use the types from step 2.

- **Router** (src/routers/user.ts): Define endpoints and attach validation middlewares.

- **App** (src/app.ts): Import the router and use it (app.use('/users', userRouter)).

## 🔍 Validation & Error Handling

- **Validation:** Do not manually check req.body in controllers. Use the validateBody(zodSchema) middleware in your router.

- **Errors:** If something goes wrong, simply throw new Error("Message", { cause: 404 }). The global error handler will catch it and send the correct status code based on the cause.

## Imports Guide

We use internal # imports defined in package.json. You should use these instead of ../../:

```
import ... from "#models"
```

```
import ... from "#controllers"
```

```
import ... from "#schemas"
```

```
import ... from "#middlewares"
```

```
import ... from "#db"
```
