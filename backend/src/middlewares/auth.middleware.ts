import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../types/index.js";
import { findUserById } from "../repositories/user.repository.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies?.token || req?.headers?.authorization?.split(" ")[1];

    if (!token) throw new ApiError(401, "Unauthorized, token not found");

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!decoded) throw new ApiError(401, "Unauthorized, invalid token");

    if (typeof decoded === "string") throw new ApiError(401, "Unauthorized");

    const user = await findUserById(decoded.id as string);
    if (!user) throw new ApiError(401, "Unauthorized, user not found");
    req.user = user;

    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    if (err instanceof jwt.TokenExpiredError)
      return next(new ApiError(401, "Unauthorized, token expired"));
    return next(new ApiError(401, "Unauthorized"));
  }
};
