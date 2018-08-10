#Magic. Reads env variables from .env file
#See: https://unix.stackexchange.com/questions/235223/makefile-include-env-file
include .env
export $(shell sed 's/=.*//' .env)

docker-build:
	docker build -t $(IMAGE_NAME):$(TAG) .

docker-publish:
	docker push $(IMAGE_NAME):$(TAG)

docker-start-dev:
	docker-compose -f docker-compose.development.yml up -d

docker-end-dev:
	docker-compose -f docker-compose.development.yml stop
	docker-compose -f docker-compose.development.yml rm

docker-start-prod:
	docker-compose -f docker-compose.production.yml up -d

docker-end-prod:
	docker-compose -f docker-compose.production.yml stop
	docker-compose -f docker-compose.production.yml rm