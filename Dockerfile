# Stage 1: Build the Vue.js app using Node.js
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining files
COPY . .

# Build the Vue.js app for production
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:alpine

# Copy the build files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 5000 for the frontend
EXPOSE 5000

# Run Nginx to serve the app
CMD ["nginx", "-g", "daemon off;"]
