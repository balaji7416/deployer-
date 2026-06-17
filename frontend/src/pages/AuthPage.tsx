import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/context/auth/useAuth";
import { useNavigate } from "react-router-dom";

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

  const handleSubmit = async () => {
    // e.preventDefault();
    if (!password) return;
    try {
      if (action === "register") {
        if (!email || !username) return;
        await register({ email, username, password });
      } else {
        if (!username) return;
        await login({ username, password });
      }
      navigate("/");
    } catch {
      return;
    }
  };

  return (
    <div className="h-screen flex px-2 bg-neutral-900">
      <div className="w-0 md:flex-1 bg-neutral-800 flex items-center justify-center p-3">
        <img
          src="/assets/rocket_image_3.jpg"
          alt="deployer image"
          className="object-cover h-full w-full rounded-2xl"
        />
      </div>
      <div className="bg-black w-full md:w-[400px] lg:w-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md bg-neutral-900 shadow-md shadow-gray-600">
          <CardHeader>
            <CardTitle className="text-gray-200">
              {action === "login" ? "Login" : "Register"} to your account
            </CardTitle>
            <CardDescription>
              Enter your credentials to {action} to your account
            </CardDescription>
            <CardAction>
              <Button
                variant="link"
                className="text-gray-200"
                onClick={() =>
                  setAction((prev) => (prev === "login" ? "register" : "login"))
                }
              >
                {action === "login" ? "Register" : "Login"}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6 text-gray-300">
                {action == "register" && (
                  <div className="grid gap-2 text-gray-300">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="eg. mail@gmail.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="grid gap-2 text-gray-300">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder=""
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {/* <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a> */}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2 bg-neutral-900 border-t-0">
            <Button
              variant="outline"
              className="w-full"
              disabled={action === "login" ? loginLoading : registerLoading}
              type="submit"
              onClick={handleSubmit}
            >
              {action === "login"
                ? loginLoading
                  ? "Logging in..."
                  : "Login"
                : registerLoading
                  ? "Registering..."
                  : "Register"}
            </Button>
          </CardFooter>
        </Card>
        {/*error messages*/}
        <div className="flex flex-col gap-2 text-red-500 font-mono">
          {action === "login" && loginError && <p>{loginError}</p>}
          {action === "register" && registerError && <p>{registerError}</p>}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
