import { clerkClient } from "@clerk/clerk-sdk-node";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please provide a valid authorization token",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        message: "Authorization token is missing",
      });
    }

    // Verify the token with Clerk
    try {
      const payload = await clerkClient.verifyToken(token);
      req.userId = payload.sub; // Clerk user ID
      req.userAuth = payload; // Store full payload if needed

      console.log(`✅ Authenticated user: ${req.userId}`);
      next();
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError);
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided token is invalid or expired",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Authentication error",
      message: "An error occurred during authentication",
    });
  }
};

// Optional auth middleware (allows both authenticated and anonymous access)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      try {
        const payload = await clerkClient.verifyToken(token);
        req.userId = payload.sub;
        req.userAuth = payload;
        console.log(`✅ Optional auth - authenticated user: ${req.userId}`);
      } catch (verifyError) {
        console.log("Optional auth - invalid token, continuing without auth");
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next(); // Continue without authentication
  }
};
