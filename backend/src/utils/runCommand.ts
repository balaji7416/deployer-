import { spawn } from "child_process";

export const runCommand = (command: string, args: string[], cwd?: string) => {
  return new Promise<string>((resolve, reject) => {
    let output = "";

    const child = spawn(command, args, {
      cwd,
      shell: true,
    });

    child.stdout.on("data", (data) => {
      process.stdout.write(data);
      output += data;
    });

    child.stderr.on("data", (data) => {
      process.stderr.write(data);
      output += data;
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
};
