const { join } = require('path');
const {
  findPackages,
  getCurrDate,
  generateChanges,
  generateMessage
} = require('./lib');

const patterns = {
  major: '<x.[x|?].[x|?]>',
  minor: '<?.x.[x|?]>',
  patch: '<?.?.x>',
  noRelease: '<no>',
};

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
  logger.log(template);
  return template;
}

module.exports = { generateNotes };
