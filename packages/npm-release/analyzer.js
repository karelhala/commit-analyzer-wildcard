const npmReleaser = require('@semantic-release/npm');
const { join } = require('path');
const recursive = require('recursive-readdir');

async function findPackages(folder) {
  const files = await recursive(join(__dirname, folder), ['node_modules', '.git']);
  return files
    .filter(file => file.indexOf('package.json') !== -1)
    .map(package => {
      const packageArr = package.split('/');
      packageArr.splice(-1);
      return packageArr.join('/')
    });
}

async function verifyConditions(pluginConfig, context) {
  return npmReleaser.verifyConditions(pluginConfig, context);
}

async function prepare(pluginConfig, context) {
  const packages = await findPackages(pluginConfig.folder);
  context.logger.log(`Preparing packages:
    * ${ packages.join('\n * ')}`);
  packages.map(async pkgRoot => await npmReleaser.prepare({ ...pluginConfig, pkgRoot }, context));
}

async function publish(pluginConfig, context) {
  const packages = await findPackages(pluginConfig.folder);
  context.logger.log(`Publishing packages:
    * ${ packages.join('\n * ')}`);
  return packages.map(async pkgRoot => await npmReleaser.publish({ ...pluginConfig, pkgRoot }, context));
}

module.exports = { verifyConditions, prepare, publish };
