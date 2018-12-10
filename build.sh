#!/usr/bin/env bash
set -euo pipefail
VERSION="1.0.0"
docker build -t jcoreio/docker-node-deploy:${VERSION} -t jcoreio/docker-node-deploy:latest .
docker push jcoreio/docker-node-deploy:${VERSION}
docker push jcoreio/docker-node-deploy:latest