FROM node:18-alpine
RUN mkdir /app
WORKDIR /app
COPY package.json ./
RUN yarn
COPY . .
CMD ["node", "./bot.js"]
