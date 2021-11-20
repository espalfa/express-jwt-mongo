############################################################
# Dockerfile for node.js - Express application
############################################################

FROM node 

WORKDIR /app 

COPY package.json package.json 

RUN npm install 

COPY . . 

EXPOSE 3000  

RUN npm install -g nodemon 

CMD [ "npm", "run", "start" ]