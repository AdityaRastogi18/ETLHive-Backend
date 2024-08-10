import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthenticatedRequest } from "../utils/customInterface";

export const handleCreateNewUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password, username } = req.body;

  try {
    let user = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (user) {
      if (user.email === email) {
        res.status(400).json({ message: "Email already exists" });
      } else if (user.username === username) {
        res.status(400).json({ message: "Username already exists" });
      }
      return;
    }

    user = new User({ name, email, password, username });
    await user.save();

    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: "10h" },
      (err, token) => {
        if (err) throw err;

        res.cookie("token", token, {
          path: "/",
        });

        res.json({
          success: true,
          email: user.email,
          token: token,
          name: user.name,
          username: user.username,
        });
      }
    );
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};

export const handleLoginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ message: "User Not Found!" });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    const payload = { id: user.id, username: user.username };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: "10h" },
      (err, token) => {
        if (err) throw err;

        res.cookie("token", token);

        res.json({
          success: true,
          email: user.email,
          token: token,
          name: user.name,
        });
      }
    );
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};

export const handleUpdateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (typeof req.user === "object" && req.user !== null) {
    const userId = req.user.id;
    const updates = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      Object.assign(user, updates);
      await user.save();

      res.json({
        success: true,
        message: "User updated successfully",
        user,
      });
    } catch (err) {
      res.status(500).json({
        message: err instanceof Error ? err.message : "An error occurred",
      });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
