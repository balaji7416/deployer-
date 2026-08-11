import { useState } from "react";
import { useAuth } from "@/context/auth/useAuth";
import { useNavigate } from "react-router-dom";
import { Rocket } from "lucide-react";

function AuthPage() {
  const [action, setAction] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    login,
    loginLoading,
    loginError,
    register,
    registerLoading,
    registerError,
  } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    try {
      if (action === "register") {
        if (!email || !username) return;
        await register({ email, username, password });
      } else {
        if (!username) return;
        await login({ username, password });
      }
      // console.log("success");
      navigate("/");
    } catch {
      // console.log("error");
      return;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-black md:flex-row">
      {/* Left / Top Rocket Banner */}
      <div className=" flex flex-col items-center justify-center gap-4 px-4 py-8  border-neutral-800 md:h-full md:flex-1 md:border-b-0 md:border-r">
        <div className="flex items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
          <Rocket className="h-16 w-16 md:h-30 md:w-30" />
        </div>
        <h1 className="text-2xl font-bold md:text-4xl">Deployer</h1>
        <p className="text-xs md:text-sm text-neutral-400">
          deploying made easy
        </p>
      </div>

      {/* Right / Form */}
      <div className="flex flex-1 flex-col items-center md:justify-center gap-5 bg-black px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-neutral-100">
                {action === "login" ? "Login" : "Register"} to your account
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Enter your credentials to {action} to your account
              </p>
            </div>
            <button
              onClick={() =>
                setAction((prev) => (prev === "login" ? "register" : "login"))
              }
              className="shrink-0 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              {action === "login" ? "Register" : "Login"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {action == "register" && (
              <div className="grid gap-2 text-gray-300">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="eg. mail@gmail.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9 w-full rounded-lg border border-neutral-700 bg-transparent px-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            )}

            <div className="grid gap-2 text-gray-300">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder=""
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-9 w-full rounded-lg border border-neutral-700 bg-transparent px-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 w-full rounded-lg border border-neutral-700 bg-transparent px-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <button
              type="submit"
              disabled={action === "login" ? loginLoading : registerLoading}
              className="mt-2 h-9 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {action === "login"
                ? loginLoading
                  ? "Logging in..."
                  : "Login"
                : registerLoading
                  ? "Registering..."
                  : "Register"}
            </button>
          </form>

          {/*error messages*/}
          <div className="mt-4 flex flex-col items-center justify-center gap-2 font-mono text-red-500">
            {action === "login" && loginError && <p>{loginError}</p>}
            {action === "register" && registerError && <p>{registerError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
