FROM circleci/node:${CIRCLE_CI_NODE_VERSION}-stretch-browsers

# Install a text editor in case we need to ssh in and edit files to debug a build
RUN sudo apt-get update && sudo apt-get install -y vim

# AWS CLI
RUN sudo apt-get install -y python-pip zip && \
  sudo pip install awscli && \
  sudo rm -rf /var/lib/apt/lists/*

# Some versions of this container include Meteor
${METEOR_INSTALL}

# set up nsswitch.conf for Go's "netgo" implementation (which Docker explicitly uses)
# - https://github.com/docker/docker-ce/blob/v17.09.0-ce/components/engine/hack/make.sh#L149
# - https://github.com/golang/go/blob/go1.9.1/src/net/conf.go#L194-L275
# - docker run --rm debian:stretch grep '^hosts:' /etc/nsswitch.conf
RUN \
if [ ! -f /etc/nsswitch.conf ]; then \
  echo 'hosts: files dns' > /etc/nsswitch.conf; \
fi

ENV DOCKER_CHANNEL stable
ENV DOCKER_VERSION 18.06.1-ce
# TODO ENV DOCKER_SHA256
# https://github.com/docker/docker-ce/blob/5b073ee2cf564edee5adca05eee574142f7627bb/components/packaging/static/hash_files !!
# (no SHA file artifacts on download.docker.com yet as of 2017-06-07 though)

RUN set -eux; \
	if ! wget -O ~/docker.tgz "https://download.docker.com/linux/static/${DOCKER_CHANNEL}/x86_64/docker-${DOCKER_VERSION}.tgz"; then \
		echo >&2 "error: failed to download 'docker-${DOCKER_VERSION}' from '${DOCKER_CHANNEL}' for 'x86_64'"; \
		exit 1; \
	fi; \
	\
	sudo tar --extract \
		--file ~/docker.tgz \
		--strip-components 1 \
		--directory /usr/local/bin/ \
	; \
	rm ~/docker.tgz; \
	\
	dockerd --version; \
	docker --version

COPY modprobe.sh /usr/local/bin/modprobe
COPY docker-entrypoint.sh /usr/local/bin/
RUN sudo chmod 777 /usr/local/bin/docker-entrypoint.sh /usr/local/bin/modprobe

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh"]
