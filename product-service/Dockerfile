FROM node:18

RUN apt-get update && apt-get install -y netcat-openbsd

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

RUN mkdir -p /app/logs

EXPOSE 3002

CMD ["sh", "-c", "./wait-for-it.sh elasticsearch 9200 -- node dist/app.js"]