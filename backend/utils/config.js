// utils/config.js
import dotenv from "dotenv";

dotenv.config(); // must be at the top-level before accessing process.env

const PORT = process.env.PORT || 3001;
const url = process.env.MONGODB_URI;
const gemini_key = process.env.GEMINI_KEY;

export { url, PORT, gemini_key };
