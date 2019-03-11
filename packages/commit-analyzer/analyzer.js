const releaseTypes = ['major', 'minor', 'patch', 'prerelease'];
let patterns = {
  major: '<x.[x|?].[x|?]>',
  minor: '<?.x.[x|?]>',
  patch: '<?.?.x>',
  noRelease: '<no>',
};

function releaseType(
  commit,
  {
    major,
    minor,
    patch,
    noRelease,
  },
  releaseNumber = 3,
) {
  if (commit.message.search(new RegExp(major), 'i') !== -1) {
    return 0;
  } if (commit.message.search(new RegExp(minor), 'i') !== -1 && releaseNumber > 1) {
    return 1;
  } if (commit.message.search(new RegExp(patch), 'i') !== -1 && releaseNumber > 2) {
    return 2;
  } if (commit.message.search(new RegExp(noRelease), 'i') !== -1 && releaseNumber > 2) {
    return null;
  }
  return 2;
}

async function commitAnalyzer({ patterns: pluginPatterns }, { logger, commits }) {
  let releaseNumber = 3;
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
  let i = 0; const iMax = commits.length;
  for (; i < iMax; i++) {
    releaseNumber = releaseType(commits[i], patterns, releaseNumber);
    if (releaseNumber === null) {
      return null;
    }
  }
  releaseNumber = releaseNumber === 3 ? 2 : releaseNumber;
  logger.log('Release version %s', releaseTypes[releaseNumber]);
  return releaseTypes[releaseNumber];
}

commitAnalyzer.releaseType = releaseType;
commitAnalyzer.patterns = patterns;

module.exports = commitAnalyzer;
