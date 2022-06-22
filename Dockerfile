FROM node:14-alpine

# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /natours
COPY . /natours
WORKDIR /natours
CMD npm run start
EXPOSE 3000