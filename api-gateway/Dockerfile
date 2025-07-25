FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN mkdir -p /app/logs

EXPOSE 4000

CMD ["node", "dist/index.js"]