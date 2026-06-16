import { run } from "node:test";
import { runCommand } from "../utils/runCommand.js";

export const prepareDB = async () => {
  //ensure volume exists
  await runCommand("docker", ["volume", "inspect", "pgdata"], {
    silent: true,
  }).catch(() => runCommand("docker", ["volume", "create", "pgdata"]));

  //check if container exists
  const exists = await runCommand(
    "docker",
    [
      "ps",
      "-a",
      "--filter",
      "name=deployer-postgres",
      "--format",
      "{{.Names}}",
    ],
    { silent: true },
  );

  if (!exists.trim()) {
    await runCommand("docker", [
      "run",
      "-d",
      "--name",
      "deployer-postgres",
      "--network",
      "deploy-net",
      "-p",
      "5433:5432",
      "-e",
      "POSTGRES_PASSWORD=postgres",
      "-e",
      "POSTGRES_DB=deployer",
      "-e",
      "TZ=Asia/Kolkata",
      "-e",
      "PGTZ=Asia/Kolkata",
      "-v",
      "pgdata:/var/lib/postgresql/data",
      "postgres:16-alpine",
    ]);

    console.log("Created postgres container with volume pgdata");
    return;
  }

  //container exists but might be stopped
  const running = await runCommand(
    "docker",
    ["ps", "--filter", "name=deployer-postgres", "--format", "{{.Names}}"],
    { silent: true },
  );

  if (!running) {
    await runCommand("docker", ["start", "deployer-postgres"]);
    console.log("started stopped postgres container");
  }
};
