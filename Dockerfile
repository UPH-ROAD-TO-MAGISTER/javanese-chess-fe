# Stage 1: Build the Vue.js app using Bun or Node.js
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files and build the project
COPY . .

# Expose port 5000 for production preview
EXPOSE 5000

# Build the production assets
RUN npm run build

# Serve the production build using Vite's preview command
CMD ["npm", "run", "dev"]
