const { patterns, releaseType } = require('@khala/commit-analyzer-wildcard');

async function generateNotes({ patterns: pluginPatterns }, { options: { analyzeCommits }, logger, commits }) {
  logger.log(commits);
  return 'Default MSG';
}

module.exports = generateNotes;
