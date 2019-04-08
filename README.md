# Docker Node Deploy

Container for building Docker images in Circle CI. Contains Docker, Git, and node.js.

## Requirements

- node.js >= 8
- yarn
- Docker CLI

## Building

```sh
docker login --username <Docker Hub username>
yarn
yarn build
```