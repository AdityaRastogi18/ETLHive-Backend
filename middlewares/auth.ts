import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../utils/customInterface";

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const secretKey = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded as { id: string; username: string; email: string };
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};
