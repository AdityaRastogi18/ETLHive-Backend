import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import { customErrorFormatter } from "../utils/helperFunctions";

export const validateRegistration = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),
  check("email").isEmail().withMessage("Invalid email address"),
  check("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  check("password")
    .isLength({ min: 7 })
    .withMessage("Password must be at least 7 characters long")
    .matches(/(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/(?=.*\d)/)
    .withMessage("Password must contain at least one number")
    .matches(/(?=.*[\W_])/)
    .withMessage("Password must contain at least one special character"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors: any = validationResult(req).formatWith(customErrorFormatter);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].message });
    }
    next();
  },
];

export const validateUsername = [
  check("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors: any = validationResult(req).formatWith(customErrorFormatter);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].message });
    }
    next();
  },
];

export const validateUserUpdate = [
  check("email").optional().isEmail().withMessage("Invalid email address"),

  check("password")
    .optional()
    .isLength({ min: 7 })
    .withMessage("Password must be at least 7 characters long")
    .matches(/(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/(?=.*\d)/)
    .withMessage("Password must contain at least one number")
    .matches(/(?=.*[\W_])/)
    .withMessage("Password must contain at least one special character"),

  check("username")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors: any = validationResult(req).formatWith(customErrorFormatter);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  },
];
