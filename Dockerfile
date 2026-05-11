FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=https://backend.espforpolice.vn
ARG VITE_API_GRADER_URL=https://grader.gsenglish.org
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_GRADER_URL=${VITE_API_GRADER_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]