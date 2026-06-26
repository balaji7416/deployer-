FROM node:20-alpine AS builder 
WORKDIR /app 
COPY package*.json ./

RUN echo "Installing dependencies..." && \
        ({{INSTALL_COMMAND}} 2>&1 || \
            (echo "Trying --legacy-peer-deps..." && \
             {{INSTALL_COMMAND}} --legacy-peer-deps 2>&1) || \
            (echo "Trying --force..." && \
              {{INSTALL_COMMAND}} --force 2>&1) || \
            (echo "All strategies failed" && exit 1))
COPY . . 

RUN echo "Building application..." && \
        ({{BUILD_COMMAND}} 2>&1 || \
            (echo "Trying with NODE_OPTIONS=--openssl-legacy-provider..." && \
             NODE_OPTIONS=--openssl-legacy-provider {{BUILD_COMMAND}} 2>&1) || \
            (echo "Trying with NODE_OPTIONS=--max-old-space-size=4096..." && \
             NODE_OPTIONS=--max-old-space-size=4096 {{BUILD_COMMAND}} 2>&1) || \
            (echo "All build strategies failed" && exit 1))

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