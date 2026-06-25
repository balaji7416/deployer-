import { AuthContext } from "./authContext";
import api from "@/utils/api";
import type { User } from "@/lib/types";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authCalled = useRef(false);
  const [user, setUser] = useState<User | null>(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerError, setRegisterError] = useState<null | string>(null);
  const [loginError, setLoginError] = useState<null | string>(null);
  const [authChecking, setAuthChecking] = useState(false);

  const navigate = useNavigate();

  const register = async ({
    email,
    username,
    password,
  }: {
    email: string;
    username: string;
    password: string;
  }) => {
    try {
      setRegisterLoading(true);
      setRegisterError(null);
      const res = await api.post("/auth/register", {
        email,
        username,
        password,
      });
      const { data }: { data: User } = res.data;
      setUser(data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error: unknown) {
      console.error("failed to register: ", error);
      let errMsg;
      if (axios.isAxiosError(error) && error.response) {
        errMsg = error.response.data?.message;
      }
      if (!errMsg)
        errMsg = error instanceof Error ? error.message : "unknown error";
      setRegisterError(errMsg);
      throw error;
    } finally {
      setRegisterLoading(false);
    }
  };

  const login = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    try {
      setLoginLoading(true);
      setLoginError(null);
      const res = await api.post("/auth/login", { username, password });
      const { data }: { data: User } = res.data;
      setUser(data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error: unknown) {
      console.error("failed to login: ", error);
      let errMsg;
      if (axios.isAxiosError(error) && error.response) {
        errMsg = error.response.data?.mesage;
      }
      if (!errMsg)
        errMsg = error instanceof Error ? error.message : "unknown error";
      setLoginError(errMsg);
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };
  const checkAuth = async () => {
    if (authCalled.current) return;
    authCalled.current = true;
    try {
      setAuthChecking(true);
      const res = await api.get("/auth/check");
      const { data }: { data: User } = res.data;
      setUser(data);
    } catch (error: unknown) {
      console.log("failed to check auth: ", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/auth");
    } finally {
      setAuthChecking(false);
    }
  };

  //for auto logout when server responds with 401, unauthorized
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/auth");
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [navigate]);

  const value = {
    user,
    setUser,
    register,
    login,
    registerLoading,
    registerError,
    loginLoading,
    loginError,
    authChecking,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
