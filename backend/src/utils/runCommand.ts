import { spawn } from "child_process";

type RunOptions = string | { cwd?: string; silent: boolean };
export const runCommand = (
  command: string,
  args: string[],
  options?: RunOptions,
) => {
  return new Promise<string>((resolve, reject) => {
    let output = "";
    let cwd: string | undefined;
    let silent = false;

    if (typeof options === "string") {
      cwd = options;
    } else if (options) {
      cwd = options.cwd;
      silent = options.silent;
    }
    const child = spawn(command, args, {
      cwd,
      shell: true,
    });

    child.stdout.on("data", (data) => {
      if (!silent) process.stdout.write(data);
      output += data;
    });

    child.stderr.on("data", (data) => {
      if (!silent) process.stderr.write(data);
      output += data;
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${output}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
};
