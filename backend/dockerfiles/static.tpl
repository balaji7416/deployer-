FROM {{BASE_IMAGE}}

COPY . /usr/share/nginx/html 

EXPOSE {{EXPOSED_PORT}}

CMD ["nginx", "-g", "daemon off;"]

