# DOCKER-VERSION 1.2.0
#
# Gnu Motion event handler
#
# Version 0.1.0

FROM busybox
MAINTAINER Seán C McCord "ulexus@gmail.com"

ADD bin/cam.docker /cam
RUN chmod +x /cam

EXPOSE 8080

ENTRYPOINT ["/cam","-logtostderr"]
CMD []
