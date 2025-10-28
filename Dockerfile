# Stage 1: Build the Vue.js app using Node.js
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the entire context. This allows two use-cases:
# 1) Full source present (CI or local): package.json exists -> run npm install && build
# 2) Only `dist` and Dockerfile present (we uploaded from CI): no package.json -> skip install/build
COPY . .

# Conditionally install and build only if package.json exists in the build context
RUN if [ -f package.json ]; then \
			echo "package.json found -> installing dependencies and building" && \
			npm install && \
			npm run build; \
		else \
			echo "No package.json found -> skipping npm install/build (assuming pre-built dist is present)"; \
		fi

# Stage 2: Serve the app using Nginx
FROM nginx:alpine

# Copy the build files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx (default)
EXPOSE 80

# Run Nginx to serve the app
CMD ["nginx", "-g", "daemon off;"]
