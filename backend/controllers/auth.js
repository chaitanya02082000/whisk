import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.js";
import { generateToken } from "../utils/auth.js";

const authRouter = Router();

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login/register
authRouter.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Google credential required" });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ googleId });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = new User({
        googleId,
        email,
        name,
        picture,
      });
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      token,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(400).json({ error: "Invalid Google token" });
  }
});

// Get current user profile
authRouter.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(403).json({ error: "Invalid token" });
  }
});

// Logout (client-side will remove token)
authRouter.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

export { authRouter };
