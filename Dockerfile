FROM node:10-alpine
WORKDIR /
COPY . .

RUN npm install 
RUN npm run build

EXPOSE 1337

ENV NODE_PORT 1337

CMD ["npm", "start"]