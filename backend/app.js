import { url } from "./utils/config.js";
import { recipeRouter } from "./controllers/routes.js";
import { chatRouter } from "./controllers/chat.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
const app = express();

console.log("Connecting to the db");
const connectDB = async () => {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to DB:", error.message);
    process.exit(1); // Exit if database connection fails
  }
};

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API routes - Fixed routing conflict
app.use("/api/recipes", recipeRouter);
app.use("/api/chat", chatRouter); // Changed to different path

// Error handler middleware
app.use((error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted ID" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
});

export { app };
