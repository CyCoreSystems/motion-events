all: test build

docker: docker_build docker_push

docker_build:
	CGO_ENABLED=0 go build -a -ldflags '-s' -o ./bin/cam.docker
	docker build -t ulexus/motion-events ./

docker_push:
	docker push ulexus/motion-events

test:
	go test

build:
	go build -o ./bin/cam

