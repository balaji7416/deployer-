FROM {{BASE_IMAGE}}

WORKDIR /app 

COPY package*.json ./ 

RUN {{INSTALL_COMMAND}}

COPY . .

EXPOSE {{EXPOSED_PORT}}

CMD ["sh", "-c", "{{START_COMMAND}}"]

