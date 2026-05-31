import { ApiError } from "../utils/apiError.js";
import type { Request, Response } from "express";

export const errorMiddleware = (
  err: ApiError | Error,
  req: Request,
  res: Response,
) => {
  let status = 500,
    message = "Something went wrong";
  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
  }
  console.log("error: ", err);
  return res.status(status).json(new ApiError(status, message));
};
