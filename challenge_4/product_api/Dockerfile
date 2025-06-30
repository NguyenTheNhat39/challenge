FROM node:lts

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Copy file .env nếu cần, nhưng thường Docker Compose sẽ truyền ENV
EXPOSE 3000

CMD ["node", "server.js"]
