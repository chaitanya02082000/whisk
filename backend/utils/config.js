import dotenv from "dotenv";

dotenv.config(); // must be at the top-level before accessing process.env

const PORT = process.env.PORT || 3001;
const url = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Fixed naming consistency

export { url, PORT, GEMINI_API_KEY };
