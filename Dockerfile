FROM node

WORKDIR /app
ADD ./index.js /app/
ADD ./config.json /app/
ADD ./package.json /app/
RUN npm install

CMD ["node", "/root/index.js"]
