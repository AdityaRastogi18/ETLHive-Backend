import { Request } from "express";
import * as jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?:
    | string
    | jwt.JwtPayload
    | {
        id: string;
        username: string;
        email: string;
      };
}
