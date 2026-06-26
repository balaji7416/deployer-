import fs from "fs/promises";
import path from "path";

const NGINX_CONF_DIR = path.join(process.cwd(), "nginx", "conf.d");

export const generateNginxConfig = async (
  deploymentId: string,
  containerName: string,
  internalPort: number,
): Promise<{ route: string; confPath: string }> => {
  const route = deploymentId;
  const confPath = path.join(NGINX_CONF_DIR, `${route}.conf`);

  const baseDomain = process.env.BASE_DOMAIN || "localhost";
  const serverName = `${route}.${baseDomain}`;

  // NOTE: Each deployment gets its own server block matching its subdomain.
  // We forward all traffic from the root "/" directly to the upstream container.
  const nginx_config = `
server {
    listen 80;
    server_name ${serverName};

    resolver 127.0.0.11 valid=30s;

    location / {
        set $upstream_target http://${containerName}:${internalPort};

        proxy_pass $upstream_target;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
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
