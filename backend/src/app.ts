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

try {
  await testDB();
} catch (e) {
  console.log("error connecting to the database: ", e);
  process.exit(1);
}

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
await reloadNginx();

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
