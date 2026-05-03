FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM alpine:3.20 AS runtime

WORKDIR /app

COPY --from=build /app/dist ./dist

RUN apk add --no-cache busybox-extras

EXPOSE 80

CMD ["sh", "-c", "httpd -f -p 80 -h /app/dist"]