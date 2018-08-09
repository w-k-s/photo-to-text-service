docker-build-dev:
	docker-compose -f docker-compose.development.yml build

docker-start-dev: docker-build-dev
	docker-compose -f docker-compose.development.yml up -d

docker-end-dev:
	docker-compose -f docker-compose.development.yml stop
	docker-compose -f docker-compose.development.yml rm

docker-build-prod:
	docker-compose -f docker-compose.production.yml build

docker-start-prod: docker-build-prod
	docker-compose -f docker-compose.production.yml up -d

docker-end-prod:
	docker-compose -f docker-compose.production.yml stop
	docker-compose -f docker-compose.production.yml rm