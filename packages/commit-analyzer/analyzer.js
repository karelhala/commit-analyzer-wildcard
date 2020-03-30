const releaseTypes = ['major', 'minor', 'patch'];
let patterns = {
  major: '<x.[x|?].[x|?]>',
  minor: '<?.x.[x|?]>',
  patch: '<?.?.x>',
  noRelease: '<no>',
};
const noReleaseType = 99;

function releaseType(
  commit,
  {
    major,
    minor,
    patch,
    noRelease,
  },
  defaultRelease = 'patch',
) {
  if (commit.message.search(new RegExp(major), 'i') !== -1) {
    return 0;
  } if (commit.message.search(new RegExp(minor), 'i') !== -1) {
    return 1;
  } if (commit.message.search(new RegExp(patch), 'i') !== -1) {
    return 2;
  } if (
    commit.message.search(new RegExp(noRelease), 'i') !== -1 || !releaseTypes.includes(defaultRelease)
  ) {
    return noReleaseType;
  }

  return releaseTypes.indexOf(defaultRelease);
}

async function analyzeCommits({ patterns: pluginPatterns, defaultRelease }, { logger, commits }) {
  patterns = {
    ...patterns,
    ...pluginPatterns,
  };

  logger.log(`Using patterns:
    *  major - ${patterns.major}
    *  minor - ${patterns.minor}
    *  patch - ${patterns.patch}
    *  noRelease - ${patterns.noRelease}`);
  logger.log(`Full patterns
  * ${Object.keys(patterns).map(key => `${key} - ${patterns[key]}`).join('\n * ')}`);

  const releaseNumbers = commits.map(
    (commit) => {
      const type = releaseType(commit, patterns, defaultRelease);
      logger.log(`Analyzing commit: ${commit.message}
      release type: ${type === noReleaseType ? 'no release' : releaseTypes[type]}`);

      return type;
    },
  );

  const releaseNumber = Math.min(...releaseNumbers);

  if (releaseNumber === noReleaseType) {
    logger.log('No release');

    return null;
  }

  logger.log('Release version %s', releaseTypes[releaseNumber]);
  return releaseTypes[releaseNumber];
}

module.exports = { analyzeCommits };
