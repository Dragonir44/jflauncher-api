# syntax=docker/dockerfile:1
FROM node:20.9

ARG PORT

WORKDIR /root

RUN mkdir uploads

COPY ./src ./src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./.env ./.env

EXPOSE $PORT:5000

RUN npm install
RUN npm run build

CMD ["npm", "start"]