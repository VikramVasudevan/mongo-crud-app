FROM node:15-alpine


ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

ENV PORT=19090
ENV MONGODB_URL=mongodb://>>>YOUR_MONGODB_URL_HERE<<<

ENV JWT_TOKEN_KEY=secret

ENV TZ=Asia/Kolkata

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install --registry >>>YOUR_REGISTRY_URL_HERE<<<

COPY --chown=node:node . .

EXPOSE 19090

USER node
CMD [ "node", "server.js" ]
