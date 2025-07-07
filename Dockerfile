# Build step
FROM node:18 as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve step (optional, only if you use this container to serve files directly)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
