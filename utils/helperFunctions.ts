import { ValidationError, Result } from "express-validator";

export function customErrorFormatter(msg: ValidationError): {
  msg: string;
} {
  return msg;
}
