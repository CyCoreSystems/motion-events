all: test docker_build

push: docker_push

docker: docker_build docker_push

docker_build:
	go build -o ./bin/convert
	docker build -t ulexus/motion-convert ./

docker_push:
	docker push ulexus/motion-convert

test:
	go test
