FROM node:22

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
