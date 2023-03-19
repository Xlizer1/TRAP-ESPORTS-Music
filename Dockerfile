FROM node:18-alpine AS BUILD
WORKDIR /build
COPY . /build
RUN yarn

FROM node:18-alpine
WORKDIR /bot
COPY --from=BUILD /usr/lib/ /usr/lib/
COPY --from=BUILD /lib/ /lib/
COPY --from=BUILD /build/ /bot
CMD ["node", "./bot.js"]
