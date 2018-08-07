docker-start-dev: 
	docker-compose -f docker-compose.development.yml build
	docker-compose -f docker-compose.development.yml up -d

docker-end-dev:
	docker-compose -f docker-compose.development.yml stop
	docker-compose -f docker-compose.development.yml rm

docker-start-prod: 
	docker-compose -f docker-compose.production.yml build
	docker-compose -f docker-compose.production.yml up -d

docker-end-prod:
	docker-compose -f docker-compose.production.yml stop
	docker-compose -f docker-compose.production.yml rm