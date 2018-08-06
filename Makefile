docker-start-dev: 
	docker-compose -f docker-compose.dev.yml build
	docker-compose -f docker-compose.dev.yml up -d

docker-end-dev:
	docker-compose -f docker-compose.dev.yml stop
	docker-compose -f docker-compose.dev.yml rm