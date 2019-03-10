const { patterns, releaseType } = require('@khala/commit-analyzer-wildcard');

const { join, resolve } = require('path');
const recursive = require('recursive-readdir');
const execa = require('execa');

async function findPackages(folder = '.', { cwd }) {
  const files = await recursive(join(cwd, folder), ['node_modules', '.git']);
  return files
    .filter(file => file.indexOf('package.json') !== -1)
    .map((file) => {
      const packageArr = file.split('/');
      packageArr.splice(-1);
      return packageArr.join('/');
    });
};

function getCurrDate() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() < 10 ? '0' : '0'}${now.getMonth()}-${now.getDate() < 10 ? '0' : ''}${now.getDate()}`;
}

async function generateNotes(
  { patterns: pluginPatterns, folder, monorepo, },
  { logger, commits, nextRelease: { version: nextVersion, gitTag: nextTag }, lastRelease: { gitTag: lastTag }, cwd, env }
) {
  const collectedPatterns = {
    ...patterns,
    ...pluginPatterns
  };
  const allPackages = (await findPackages(folder || monorepo, { cwd })).map(onePckg => {
    console.log(cwd, onePckg);
    return onePckg.substring(cwd.length + (folder || monorepo).length);
  });
  console.log(allPackages);
  commits.reduce(async (acc, curr) => {
    const { stdout } = await execa('git', ['diff-tree', '--no-commit-id', '--name-only', '-r', curr.hash]);
    console.log(stdout.split('/n'));
    stdout.split('\n').reduce((affectted, file) => {
      const pckg = allPackages.find(onePckg => file.indexOf(onePckg) !== -1);
      console.log(pckg);
    }, []);
  }, []);
  const bugFixes = [];
  const minorChanges = [];
  const majorChanges = [];
  return template = `
  ## [${nextVersion}](https://github.com/${env.TRAVIS_REPO_SLUG}/compare/${lastTag}...${nextTag}) (${getCurrDate()})
  ${majorChanges.length !== 0 ? '### Major changes': ''}
  ${minorChanges.length !== 0 ? '### Minor changes' : ''}
  ${bugFixes.length !== 0 ? '### Bug fixes' : ''}
  `;
}

module.exports = generateNotes;
