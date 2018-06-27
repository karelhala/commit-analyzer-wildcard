const releaseTypes = ['major', 'minor', 'patch', 'prerelease'];
let patterns = {
  major: '<x.[x|?].[x|?]>',
  minor: '<?.x.[x|?]>',
  patch: '<?.?.x>',
  noRelease: '<no>',
};

async function commitAnalyzer(pluginConfig, { options: { analyzeCommits }, logger, commits }) {
  let releaseNumber = 3;
  if (analyzeCommits instanceof Array) {
    analyzeCommits.map((onePlugin) => {
      patterns = {
        ...patterns,
        ...onePlugin.patterns,
      };
      return null;
    });
  }

  logger.log(`Using patterns:
      major - ${patterns.major}
      minor - ${patterns.minor}
      patch - ${patterns.patch}
      noRelease - ${patterns.noRelease}`);
  let i = 0; const iMax = commits.length;
  for (; i < iMax; i++) {
    if (commits[i].message.search(new RegExp(patterns.major), 'i') !== -1) {
      releaseNumber = 0;
    } else if (commits[i].message.search(new RegExp(patterns.minor), 'i') !== -1 && releaseNumber > 1) {
      releaseNumber = 1;
    } else if (commits[i].message.search(new RegExp(patterns.patch), 'i') !== -1 && releaseNumber > 2) {
      releaseNumber = 2;
    } else if (commits[i].message.search(new RegExp(patterns.noRelease), 'i') !== -1 && releaseNumber > 2) {
      logger.log('No release!');
      return null;
    }
  }
  releaseNumber = releaseNumber === 3 ? 2 : releaseNumber;
  logger.log('Release version %s', releaseTypes[releaseNumber]);
  return releaseTypes[releaseNumber];
}

module.exports = commitAnalyzer;
