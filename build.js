const fs = require('fs-extra')
const path = require('path')
const {flatten} = require('lodash')
const {spawn: _spawn} = require('promisify-child-process')

const PROJECT_NAME = 'jcoreio/docker-node-deploy'

const CONTAINER_VERSIONS = {
  'meteor-node8': {nodeVersion: '8.15.1', meteor: true},
  'node10': {nodeVersion: '10.15.3', meteor: false},
}

const srcDir = path.join(__dirname, 'src')
const {version} = require('./package.json')

async function build() {
  const dockerfileTemplate = await fs.readFile(path.join(srcDir, 'Dockerfile'), 'utf8')
  for (const containerVersion in CONTAINER_VERSIONS) {
    const {nodeVersion, meteor} = CONTAINER_VERSIONS[containerVersion]
    const tmpDir = path.join(__dirname, 'tmp', containerVersion)
    await fs.emptyDir(tmpDir)
    for (const file of ['docker-entrypoint.sh', 'modprobe.sh']) {
      await fs.copy(path.join(srcDir, file), path.join(tmpDir, file))
    }
    const dockerfile = dockerfileTemplate
      .replace('${CIRCLE_CI_NODE_VERSION}', nodeVersion)
      .replace('${METEOR_INSTALL}', meteor ? `
# https://github.com/coreos/bugs/issues/1095#issuecomment-336872867
RUN sudo apt-get update
RUN sudo apt-get install -y bsdtar && sudo ln -sf $(which bsdtar) $(which tar)
RUN curl https://install.meteor.com/ | sh
` : '')
    await fs.writeFile(path.join(tmpDir, 'Dockerfile'), dockerfile)
    const tags = [
      `${PROJECT_NAME}:${containerVersion}-${version}`,
      `${PROJECT_NAME}:${containerVersion}-latest`,
    ]

    const spawn = async (command, args) => {
      console.log(`$ ${command}${args.length ? ' ' + args.join(' ') : ''}`)
      await _spawn(command, args, {cwd: tmpDir, stdio: 'inherit'})
    }

    await spawn('docker', ['build',
      ...flatten(tags.map(tag => ['-t', tag])), '.'])
    for (const tag of tags) {
      await spawn('docker', ['push', tag])
    }
  }
}

build()
