import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";
dotenv.config();

import { testDB } from "./db/pool.js";
import { prepareDB } from "./db/prepareDB.js";

import { ApiError } from "./utils/apiError.js";
import { reconcile } from "./services/reconcile.js";
import { startNginx } from "./services/nginx/startNginx.js";
import { createDockerNet } from "./services/createDockerNet.js";
import { reloadNginx } from "./services/nginx/reloadNginx.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";

import deploymentRouter from "./routes/deployment.routes.js";
import authRouter from "./routes/auth.routes.js";

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/deployments", deploymentRouter);
app.use("/api/auth", authRouter);

app.use((req, res, next) => {
  next(new ApiError(404, `route ${req.method} ${req.url} not found`));
});

app.use(errorMiddleware);

//starting requirements sequence

try {
  await createDockerNet();
} catch (e) {
  console.log("error in creating docker network: ", e);
  process.exit(1);
}

try {
  await prepareDB();
} catch (e) {
  console.log("error setting docker postgres container: ", e);
}

// connect to database
const connectToDB = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      await testDB();
      return;
    } catch (e) {
      console.log("failed to connect to database, retrying...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log("failed to connect to database, exiting...");
  throw new Error("failed to connect to database");
};

await connectToDB();

try {
  await reconcile();
} catch (e) {
  console.log("error in reconciliation:", e);
  process.exit(1);
}

try {
  await startNginx();
} catch (e) {
  console.log("error in starting nginx: ", e);
  process.exit(1);
}
await reloadNginx(null);

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
