# Use an official Node.js image as the base
FROM node

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json /app

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . /app

# Define the command to run your application
CMD ["node", "index.js"]