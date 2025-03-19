FROM node:20 AS base

# Define ARGs for environment variables
ARG PUBLIC_HOST
ARG PUBLIC_RELAY_PORT
ARG PUBLIC_WEB_PORT
ARG PUBLIC_API_PORT
ARG PUBLIC_APP_ENV=production
ARG PUBLIC_BLOSSOM_URL

# Set as environment variables
ENV PUBLIC_HOST=$PUBLIC_HOST
ENV PUBLIC_RELAY_PORT=$PUBLIC_RELAY_PORT
ENV PUBLIC_WEB_PORT=$PUBLIC_WEB_PORT
ENV PUBLIC_API_PORT=$PUBLIC_API_PORT
ENV PUBLIC_APP_ENV=$PUBLIC_APP_ENV
ENV PUBLIC_BLOSSOM_URL=$PUBLIC_BLOSSOM_URL

WORKDIR /app
COPY . .

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Install dependencies
RUN bun install

# Build the web app
WORKDIR /app/apps/web
RUN bunx --bun vite build

# Serve with a lightweight server
FROM nginx:alpine AS runner
COPY --from=base /app/apps/web/dist /usr/share/nginx/html
COPY --from=base /app/infra/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 