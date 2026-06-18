import {
  hashPassword,
  verifyPassword,
  generateToken,
} from "../services/auth.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { User } from "../types/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  findUserByUsername,
  findUserByEmail,
  createUser,
} from "../repositories/user.repository.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
  }: { username: string; email: string; password: string } = req.body;

  if (!username) throw new ApiError(400, "username is required");
  if (!email) throw new ApiError(400, "email is required");
  if (!password) throw new ApiError(400, "password is required");

  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    throw new ApiError(400, "user already exists, please login");
  }

  const passwordHash = await hashPassword(password);

  const user = await createUser({ username, email, password: passwordHash });

  const token = generateToken(user.id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "user created", { ...user, token }));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const {
    username = "",
    password,
    email = "",
  }: { username: string; password: string; email: string } = req.body;
  if (!username && !email)
    throw new ApiError(400, "username or email is required");
  if (!password) throw new ApiError(400, "password is required");

  const user = username
    ? await findUserByUsername(username)
    : await findUserByEmail(email);

  if (!user) throw new ApiError(404, "user not found");

  const isPasswordCorrect = verifyPassword(password, user.password);
  if (!isPasswordCorrect) throw new ApiError(401, "invalid password");

  const token = generateToken(user.id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "user logged in", { ...user, token }));
});

export const checkAuth = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req;
  return res.status(200).json(new ApiResponse(200, "user logged in", user));
});
