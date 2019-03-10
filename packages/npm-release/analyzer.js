const npmReleaser = require('@semantic-release/npm');
const { join } = require('path');
const recursive = require('recursive-readdir');

async function findPackages(folder = '.', context) {
  const files = await recursive(join(context.cwd, folder), ['node_modules', '.git']);
  return files
    .filter(file => file.indexOf('package.json') !== -1)
    .map((file) => {
      const packageArr = file.split('/');
      packageArr.splice(-1);
      return packageArr.join('/');
    });
}

async function verifyConditions(pluginConfig, context) {
  return npmReleaser.verifyConditions(pluginConfig, context);
}

async function prepare(pluginConfig, context) {
  const packages = await findPackages(pluginConfig.folder, context);
  context.logger.log(`Preparing packages:
  * ${packages.join('\n * ')}`);
  packages.map(async pkgRoot => npmReleaser.prepare({ ...pluginConfig, pkgRoot }, context));
}

async function publish(pluginConfig, context) {
  const packages = await findPackages(pluginConfig.folder, context);
  context.logger.log(`Publishing packages:
  * ${packages.join('\n * ')}`);
  return packages.reduce(async (acc, pkgRoot) => {
    const release = await npmReleaser.publish({ ...pluginConfig, pkgRoot }, context);
    return {
      ...acc,
      [pkgRoot.split('/').slice(-1)]: release,
    };
  }, {});
}

module.exports = { verifyConditions, prepare, publish };
