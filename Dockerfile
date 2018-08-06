FROM node:alpine

WORKDIR /usr/src/app
ADD . /usr/src/app

#https://github.com/kelektiv/node.bcrypt.js/issues/577
RUN apk update && apk upgrade \
	&& apk add --no-cache git \
	&& apk --no-cache add --virtual builds-deps build-base python \
	&& npm install -g nodemon cross-env eslint npm-run-all node-gyp node-pre-gyp && npm install --only=production\
	&& npm rebuild bcrypt --build-from-source

ENTRYPOINT ["npm", "run", "app"]