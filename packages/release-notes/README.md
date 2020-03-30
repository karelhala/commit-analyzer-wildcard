# Monorepo wild card release notes
Monorepo release notes based on [@khala/commit-analyzer-wildcard](https://www.npmjs.com/package/@khala/commit-analyzer-wildcard) for [semantic-release](https://github.com/semantic-release/semantic-release) package.

## Installation
* Using NPM
```bash
> npm install -D @khala/wildcard-release-notes
```
* Using yarn
```
> yarn add -D @khala/wildcard-release-notes
```

Then add it to your `generateNotes`options

* `package.json`
```JSON
{
  "release": {
    "generateNotes": [
      {
        "path": "@khala/wildcard-release-notes"
      }
    ]
  }
}
```

## Options
This package will assume that you want to generate release notes for packages under root folder you ran release. If you want to release packages under different folder (for instance all packages under folder `plugins`) you have to add `folder` option to `generateNotes` option. Or if you want to set this up globally add `monorepo` prop to release config.
```JSON
{
  "release": {
    "generateNotes": [
      {
        "path": "@khala/wildcard-release-notes",
        "folder": "./plugins"
      }
    ]
  }
}
```

```JSON
{
  "release": {
    "monorepo": "./plugins",
    "generateNotes": "@khala/wildcard-release-notes"
  }
}
```

If you are not using Travis as your CI environment, you can specify the repository name (GitHub) manually:

```JSON
{
  "release": {
    "generateNotes": [
      {
        "path": "@khala/wildcard-release-notes",
        "folder": "./plugins",
        "repositoryName": "organisation/repository"
      }
    ]
  }
}
```

Otherwise `env.TRAVIS_REPO_SLUG` is used automatically.
