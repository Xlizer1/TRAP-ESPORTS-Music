FROM node:18-alpine AS BUILD
RUN mkdir /app
WORKDIR /app
COPY package.json ./
RUN yarn
COPY . .
CMD ["node", "./bot.js"]