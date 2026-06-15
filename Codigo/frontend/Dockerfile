# Codigo/frontend/Dockerfile
FROM node:jod-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run vite dev server, passing "--host 0.0.0.0" to the "vite" command
# The "--" separates npm arguments from the script's arguments
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]