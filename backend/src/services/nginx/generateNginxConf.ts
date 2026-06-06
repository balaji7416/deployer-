import fs from "fs/promises";
import path from "path";
import { deploy } from "../../controllers/deployment.controller.js";
import { config } from "dotenv";

const NGINX_CONF_DIR = path.join(process.cwd(), "nginx", "conf.d");

export const generateNginxConfig = async (
  deploymentId: string,
  containerName: string,
  internalPort: number,
): Promise<{ route: string; confPath: string }> => {
  const route = deploymentId;
  const confPath = path.join(NGINX_CONF_DIR, `${route}.conf`);

  const nginx_config = `
        server {
            listen 80; 

            server_name localhost;

            location /${route}/ {
                proxy_pass http://${containerName}:${internalPort}/; 
                
                proxy_set_header Host $host; 
                proxy_set_header X-Real-IP $remote_addr; 
                proxy_set_header X-forwarded-For $proxy_add_x_forwarded_for; 
                proxy_set_header X-forwarded-Proto $scheme;
            }
        }
    `;

  await fs.mkdir(NGINX_CONF_DIR, { recursive: true });
  await fs.writeFile(confPath, nginx_config);

  return {
    route,
    confPath,
  };
};
