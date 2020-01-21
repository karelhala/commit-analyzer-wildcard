const { join } = require('path');
const recursive = require('recursive-readdir');
const execa = require('execa');

const patterns = {
  major: '<x.[x|?].[x|?]>',
  minor: '<?.x.[x|?]>',
  patch: '<?.?.x>',
  noRelease: '<no>',
};

const commiMapper = [
  'majorChanges',
  'minorChanges',
  'bugFixes',
];

function releaseType(
  { message },
  {
    major,
    minor,
    patch,
    noRelease,
  },
  releaseNumber = 3,
) {
  if (message.search(new RegExp(major), 'i') !== -1) {
    return 0;
  } if (message.search(new RegExp(minor), 'i') !== -1 && releaseNumber > 1) {
    return 1;
  } if (message.search(new RegExp(patch), 'i') !== -1 && releaseNumber > 2) {
    return 2;
  } if (message.search(new RegExp(noRelease), 'i') !== -1 && releaseNumber > 2) {
    return null;
  }
  return 2;
}

async function findPackages(folder) {
  const files = await recursive(folder, ['node_modules', '.git']);
  return files
    .filter(file => file.indexOf('package.json') !== -1)
    .map((file) => {
      const packageArr = file.split('/');
      packageArr.splice(-1);
      return packageArr.join('/');
    });
}

function getCurrDate() {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1) < 10 ? '0' : ''}${now.getMonth() + 1}-${now.getDate() < 10 ? '0' : ''}${now.getDate()}`;
}

async function groupMessages(allPackages, { hash, message }) {
  const { stdout } = await execa('git', ['diff-tree', '--no-commit-id', '--name-only', '-r', hash]);
  return stdout.split('\n').reduce((affectted, file) => {
    const pckg = allPackages.find(onePckg => file.indexOf(onePckg) !== -1);
    return {
      ...affectted,
      ...pckg ? { [pckg]: message } : {},
    };
  }, {});
}

async function generateChanges(allPackages, commits, collectedPatterns) {
  return commits.reduce(async (acc, curr) => {
    const commitsPromise = await acc;
    const commitType = commiMapper[releaseType(curr, collectedPatterns)];
    if (!commitType) {
      return commitsPromise;
    }
    const groupped = await groupMessages(allPackages, curr);
    Object.keys(groupped).forEach((pckg) => {
      commitsPromise[commitType][pckg] = [
        ...commitsPromise[commitType][pckg] ? commitsPromise[commitType][pckg] : [],
        groupped[pckg],
      ];
    });
    return commitsPromise;
  }, { bugFixes: {}, minorChanges: {}, majorChanges: {} });
}

async function pckgName(pckgFile, folder) {
  // eslint-disable-next-line global-require
  return (await require(join(folder, pckgFile, 'package.json'))).name; // eslint-disable-line import/no-dynamic-require
}

async function generateMessage(changes, folder, version) {
  const routes = await Object.keys(changes).map(async (key) => {
    const pckg = await pckgName(key, folder);
    return `\n### [${pckg}~${version}](https://www.npmjs.com/package/${pckg}/v/${version}) \n * ${changes[key].join('\n * ')}`;
  });
  return (await Promise.all(routes)).join('\n');
}

module.exports = {
  generateMessage,
  releaseType,
  findPackages,
  getCurrDate,
  groupMessages,
  pckgName,
  generateChanges,
  patterns,
};
