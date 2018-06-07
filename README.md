# commit-analyzer-wildcard
Wildcard commit analyzer for [semantic-release](https://github.com/semantic-release/semantic-release) to find substrings in each commit message.

[![Travis](https://img.shields.io/travis/karelhala/commit-analyzer-wildcard.svg)](https://travis-ci.org/karelhala/commit-analyzer-wildcard)
[![npm latest version](https://img.shields.io/npm/v/@khala/commit-analyzer-wildcard/latest.svg)](https://www.npmjs.com/package/@khala/commit-analyzer-wildcard)

## Installation
* Using NPM
```bash
> npm install -D @khala/commit-analyzer-wildcard
```
* Using yarn
```
> yarn add -D @khala/commit-analyzer-wildcard
```

Then add it to your `release` options

* `package.json`
```JSON
{
  "release": {
    "analyzeCommits": "@khala/commit-analyzer-wildcard/analyzer"
  }
}
```
* `.releaserc`
```JSON
{
  "analyzeCommits": "@khala/commit-analyzer-wildcard/analyzer"  
}
```
## Options

To change default patterns you can pass your own in your release option.
```JSON
{
  "release": {
    "analyzeCommits": [
      {
        "path": "@khala/commit-analyzer-wildcard/analyzer",
        "patterns": {
          "major": "<x.[x|?].[x|?]>",
          "minor": "<?.x.[x|?]>",
          "patch": "<?.?.x>",
          "noRelease": "<no>"
        } 
      }
    ]
  }
}
```

Each pattern is transfered into Regular Expression and searched in each commit message.