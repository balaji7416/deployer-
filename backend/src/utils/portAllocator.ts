import net from "net";
import { arraySync } from "stream/iter";

const start_port = 3000;
const end_port = 3999;

const isPortFree = async (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer().listen(port);
    server.on("listening", () => {
      server.close();
      resolve(true);
    });
    server.on("error", () => {
      resolve(false);
    });
  });
};

export const getPort = async (): Promise<number> => {
  for (let port = start_port; port <= end_port; port++) {
    if (await isPortFree(port)) return port;
  }
  throw new Error("No free ports");
};

export const freePort = async (port: number): Promise<void> => {
  return new Promise((resolve) => {});
};
