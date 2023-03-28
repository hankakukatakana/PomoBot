FROM node

WORKDIR /app

ADD ./package.json /app/

RUN npm install

ADD ./index.js /app/
ADD ./config.json /app/
ADD ./test_config.json /app/
ADD ./commands.json /app/


CMD ["node", "/app/index.js"]
