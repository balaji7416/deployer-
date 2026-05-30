import fs from "fs/promises";
import path from "path";

const DOCKERIGNORE_CONT = `
    node_modules
    .git
    .env
    dist
    build
    *.log
`.trim();

export const generateDockerignore = async (
  workspacePath: string,
): Promise<void> => {
  await fs.writeFile(
    path.join(workspacePath, ".dockerignore"),
    DOCKERIGNORE_CONT,
  );
};
