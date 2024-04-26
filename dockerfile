FROM node:21.6-slim 

ENV TOKEN_FILE /run/secrets/token
ENV MONGO_URI mongodb://mongo:27017

RUN apt update && apt install -y curl; apt clean

RUN mkdir /app

WORKDIR /app

RUN mkdir uploads

COPY ./dist ./dist
COPY ./package.json ./package.json

RUN echo "PORT=5000" > .env
RUN echo "TOKEN_FILE=${TOKEN_FILE}" >> .env

EXPOSE 5000

RUN npm install --production

CMD ["npm", "start"]