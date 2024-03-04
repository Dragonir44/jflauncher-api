# syntax=docker/dockerfile:1
FROM node:21.6-slim 

RUN apt update && apt install -y curl; apt clean

RUN mkdir /app

WORKDIR /app

RUN mkdir uploads

COPY ./src ./src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./.env ./.env

EXPOSE 5000

RUN npm install
RUN npm run build

CMD ["npm", "start"]