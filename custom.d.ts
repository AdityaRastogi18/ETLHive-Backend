// custom.d.ts
import "express";

declare global {
  namespace Express {
    interface Request {
      user?: any; // You can specify a more precise type here if needed
    }
  }
}
