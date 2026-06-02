FROM node:20-alpine AS builder 
WORKDIR /app 
COPY package*.json ./
RUN {{INSTALL_COMMAND}}
COPY . . 
RUN {{BUILD_COMMAND}}

FROM nginx:alpine

RUN echo 'server { \
        listen 80; \
        root /usr/share/nginx/html; \
        index index.html; \
        location / { \
            try_files $uri /index.html; \
        } \
    }' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/{{OUTPUT_DIR}} /usr/share/nginx/html
EXPOSE {{EXPOSED_PORT}}
CMD ["nginx","-g", "daemon off;"]