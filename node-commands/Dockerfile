ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest
FROM $BUILD_FROM

# Install Node.js
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy files
COPY package.json .
COPY server.js .

# Install dependencies
RUN npm install --production

# Expose port for HTTP
EXPOSE 3000

# Start the Node.js script
CMD ["npm", "start"]
