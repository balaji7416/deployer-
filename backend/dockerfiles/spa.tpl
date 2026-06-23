FROM node:20-alpine AS builder 
WORKDIR /app 
COPY package*.json ./
RUN {{INSTALL_COMMAND}}
COPY . . 
RUN {{BUILD_COMMAND}}

FROM nginx:alpine

# Copy built files to root
COPY --from=builder /app/{{OUTPUT_DIR}} /usr/share/nginx/html

RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Serve files directly, falling back to index.html for SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]