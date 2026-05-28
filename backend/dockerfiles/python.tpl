
FROM {{BASE_IMAGE}}

WORKDIR /app

COPY requirements*.txt ./

RUN {{INSTALL_COMMAND}}

COPY . .

EXPOSE {{EXPOSED_PORT}}

CMD ["sh","-c","{{START_COMMAND}}"]