const { patterns, releaseType } = require('@khala/commit-analyzer-wildcard');

const { join } = require('path');
const recursive = require('recursive-readdir');
const execa = require('execa');

const commiMapper = [
  'majorChanges',
  'minorChanges',
  'bugFixes',
];

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
  return `${now.getFullYear()}-${now.getMonth() < 10 ? '0' : '0'}${now.getMonth()}-${now.getDate() < 10 ? '0' : ''}${now.getDate()}`;
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

async function generateNotes(
  { patterns: pluginPatterns, folder, monorepo },
  {
    logger,
    commits,
    nextRelease: { version: nextVersion, gitTag: nextTag },
    lastRelease: { gitTag: lastTag },
    cwd,
    env,
  },
) {
  const root = join(cwd, folder || monorepo || '.');
  const allPackages = (await findPackages(root)).map(
    onePckg => onePckg.substring(root.length),
  );
  const { bugFixes, minorChanges, majorChanges } = await generateChanges(
    allPackages,
    commits,
    {
      ...patterns,
      ...pluginPatterns,
    },
  );
  logger.log(`
  Bug fixes: ${Object.keys(bugFixes).map(key => `${key} - ${bugFixes[key]}`)}
  `);
  logger.log(`
  Minor changes: ${Object.keys(minorChanges).map(key => `${key} - ${minorChanges[key]}`)}
  `);
  logger.log(`
  Major changes: ${Object.keys(majorChanges).map(key => `${key} - ${majorChanges[key]}`)}
  `);
  const majorChangesTemplate = await generateMessage(majorChanges, root, nextVersion);
  const minorChangesTemplate = await generateMessage(minorChanges, root, nextVersion);
  const bugFixesTemplate = await generateMessage(bugFixes, root, nextVersion);
  const template = `
# [${nextVersion}](https://github.com/${env.TRAVIS_REPO_SLUG}/compare/${lastTag}...${nextTag}) (${getCurrDate()})
${Object.keys(majorChanges).length !== 0 ? `## Major changes\n${majorChangesTemplate}\n` : ''}
${Object.keys(minorChanges).length !== 0 ? `## Minor changes\n${minorChangesTemplate}\n` : ''}
${Object.keys(bugFixes).length !== 0 ? `## Bug fixes\n${bugFixesTemplate}\n` : ''}
  `;
  return template;
}

module.exports = generateNotes;
