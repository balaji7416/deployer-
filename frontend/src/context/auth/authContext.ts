import { createContext } from "react";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  login: ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => Promise<void>;
  register: ({
    email,
    username,
    password,
  }: {
    email: string;
    username: string;
    password: string;
  }) => Promise<void>;
  loginLoading: boolean;
  loginError: string | null;
  registerLoading: boolean;
  registerError: string | null;
  authChecking: boolean;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
