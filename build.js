const fs = require('fs-extra')
const path = require('path')
const {flatten} = require('lodash')
const {spawn: _spawn} = require('promisify-child-process')

const PROJECT_NAME = 'jcoreio/docker-node-deploy'

const CIRCLE_CI_NODE_VERSIONS = {
  '8': '8.15.1',
  '10': '10.15.3',
}

const srcDir = path.join(__dirname, 'src')
const {version} = require('./package.json')

async function build() {
  const dockerfileTemplate = await fs.readFile(path.join(srcDir, 'Dockerfile'), 'utf8')
  for (const nodeVersion in CIRCLE_CI_NODE_VERSIONS) {
    const tmpDir = path.join(__dirname, 'tmp', `node-${nodeVersion}`)
    await fs.emptyDir(tmpDir)
    for (const file of ['docker-entrypoint.sh', 'modprobe.sh']) {
      await fs.copy(path.join(srcDir, file), path.join(tmpDir, file))
    }
    const dockerfile = dockerfileTemplate.replace('${CIRCLE_CI_NODE_VERSION}',
      CIRCLE_CI_NODE_VERSIONS[nodeVersion])
    await fs.writeFile(path.join(tmpDir, 'Dockerfile'), dockerfile)
    const tags = [
      `${PROJECT_NAME}:node${nodeVersion}-${version}`,
      `${PROJECT_NAME}:node${nodeVersion}-latest`,
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
