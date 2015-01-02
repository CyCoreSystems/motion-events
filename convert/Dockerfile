# DOCKER-VERSION 1.2.0
#
# Video converter
#
# Version 0.1.0

FROM ubuntu:utopic
MAINTAINER Seán C McCord "ulexus@gmail.com"

# Install video conversion tool (libav)
RUN apt-get update
RUN apt-get install -y libav-tools

ADD bin/convert /convert
RUN chmod +x /convert

ENTRYPOINT ["/convert","-logtostderr"]
CMD []
