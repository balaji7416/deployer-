import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { testDB } from "./db/pool.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import deploymentRouter from "./routes/deployment.routes.js";
import { ApiError } from "./utils/apiError.js";

const app = express();

app.use(express.json());

app.use("/api/deployments", deploymentRouter);

app.use((req, res, next) => {
  next(new ApiError(404, `route ${req.originalUrl} not found`));
});

app.use(errorMiddleware);

try {
  await testDB();
} catch (e) {
  console.log("error connecting to the database: ", e);
  process.exit(1);
}

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
