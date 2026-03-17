import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export const authMiddleware = (req: Request & { userId?: string },res: Response,next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token not provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
    token as string,
    process.env.ACCESS_TOKEN_SECRET_KEY as string
    );

    if (typeof decoded === "string") {
    return res.status(401).json({ error: "Invalid token payload" });
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};