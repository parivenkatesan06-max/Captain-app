# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package.json ./
RUN npm install

# Copy app source and build
COPY . ./
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets into nginx public folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port nginx will listen on
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
