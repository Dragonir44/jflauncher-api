# syntax=docker/dockerfile:1
FROM node:21.6-slim 

ENV TOKEN_FILE /run/secrets/token

RUN apt update && apt install -y curl; apt clean

RUN mkdir /app

WORKDIR /app

RUN mkdir uploads

COPY ./src ./src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json

RUN echo "PORT=5000" > .env
RUN echo "TOKEN_FILE=${TOKEN_FILE}" >> .env

EXPOSE 5000

RUN npm install
RUN npm run build

CMD ["npm", "start"]