up:
	@docker-compose rm -f
	@docker-compose pull
	@sed -e "s/HOSTIP/$$(docker-machine ip)/g" docker-compose.yml | docker-compose --file - up --build -d
	@docker-compose run js-pubsub-google-cloud /bin/bash

down:
	@docker-compose stop -t 1
