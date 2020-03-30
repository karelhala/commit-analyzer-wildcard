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

## Default usage
Simply add some special characters to any of your commit messages and new release will be triggered
* Major - `<x.x.x>` or `<x.x.?>` or `<x.?.x>` or `<x.?.?>`
* Minor - `<?.x.x>` or `<?.x.?>`
* Bug - `<?.?.x>`
* No release - `<no>`

To trigger automatic release add this to `package.json` and install [semantic-release](https://www.npmjs.com/package/semantic-release)
```JSON
{
  "scripts": {
    "release": "semantic-release"
  }
}
```

Settings for travis is
```YML
after_success:
- npm run release
```

## Options

### Patterns

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

### defaultRelease

Can be set to one of:

```jsx
['major', 'minor', 'patch'];
```

DefaultRelease is set to `patch`.

```JSON
{
  "release": {
    "analyzeCommits": [
      {
        "path": "@khala/commit-analyzer-wildcard/analyzer",
        "defaultRelease": "major"
      }
    ]
  }
}
```

You can turn the releasing off by setting a value not included in the array:

```JSON
{
  "release": {
    "analyzeCommits": [
      {
        "path": "@khala/commit-analyzer-wildcard/analyzer",
        "defaultRelease": "noRelease"
      }
    ]
  }
}
```
