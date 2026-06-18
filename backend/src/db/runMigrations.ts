import { pool } from "./pool.js";
import path from "path";
import fs from "fs/promises";

import { prepareDB } from "./prepareDB.js";
import { testDB } from "./pool.js";

export const runMigrations = async () => {
  const client = await pool.connect();
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
    const sql = await fs.readFile(
      path.join(
        process.cwd(),
        "src",
        "db",
        "migrations",
        "create_deployments.sql",
      ),
      "utf-8",
    );
    await client.query(sql);
  } catch (err) {
    console.log("error running migrations: ", err);
    throw err;
  } finally {
    client.release();
  }
};
