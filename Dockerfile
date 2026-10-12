# Build the Vite app with the API origin embedded into its public browser bundle.
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_CURRENCY_CODE=TZS
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CURRENCY_CODE=${VITE_CURRENCY_CODE}

RUN npm run build

# Serve the static app with Nginx and send client-side routes to index.html.
FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
