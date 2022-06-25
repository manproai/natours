FROM node:14-alpine

WORKDIR /natours
COPY . /natours
WORKDIR /natours
CMD npm run start
EXPOSE 3000