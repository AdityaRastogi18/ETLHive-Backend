import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import { customErrorFormatter } from "../utils/helperFunctions";

export const validateLead = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  check("email")
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Invalid email address"),

  check("number")
    .notEmpty()
    .withMessage("Phone Number is required!")
    .isLength({ min: 10 })
    .withMessage("Enter a valid Phone Number"),

  check("product.productName")
    .notEmpty()
    .withMessage("Product name is required!"),

  check("product.productID").notEmpty().withMessage("Product ID is required!"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors: any = validationResult(req).formatWith(customErrorFormatter);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  },
];
