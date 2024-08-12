import "dotenv/config";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthenticatedRequest } from "../utils/customInterface";
import { sendMail } from "../services/mailer";

export const handleCreateNewUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  let { email, password, username } = req.body;
  email = email.toLowerCase();
  username = username.toLowerCase();
  try {
    let user = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (user) {
      if (user.username === username) {
        res.status(400).json({ message: "Username already exists" });
      } else if (user.email === email) {
        res.status(400).json({ message: "Email already exists" });
      }
      return;
    }

    user = new User({ email, password, username });
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

        res.status(201).json({
          success: true,
          email: user.email,
          token: token,
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
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });
    if (!user) {
      res.status(404).json({ message: "User Not Found!" });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    const payload = { id: user.id, username: user.username, email: user.email };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: "10h" },
      (err, token) => {
        if (err) throw err;

        res.cookie("token", token);

        res.status(200).json({
          success: true,
          email: user.email,
          username: user.username,
          token: token,
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

      res.status(200).json({
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

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const secret = process.env.JWT_SECRET || "defaultSecret";

    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await sendMail({
      to: email,
      subject: "Password Reset Request",
      templateName: "forgotPassword",
      context: {
        username: user.username,
        resetLink,
      },
    });

    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
