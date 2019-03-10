# Monorepo npm release
Monorepo npm release process for [semantic-release](https://github.com/semantic-release/semantic-release).

## Installation
* Using NPM
```bash
> npm install -D @khala/npm-release-monorepo
```
* Using yarn
```
> yarn add -D @khala/npm-release-monorepo
```

Then add it to your `prepare` and `publish` options

* `package.json`
```JSON
{
  "release": {
    "prepare": [
      {
        "path": "@khala/npm-release-monorepo"
      }
    ],
    "publish": [
      {
        "path": "@khala/npm-release-monorepo"
      }
    ]
  }
}
```

## Options
This package will assume that you want to release packages under root folder you ran release. If you want to release packages under different folder (for instance all packages under folder `plugins`) you have to add `folder` option to any step (preferably to both `prepare` and `publish`). Or if you want to set this up globally add `monorepo` prop to release config.
```JSON
{
  "release": {
    "prepare": [
      {
        "path": "@khala/npm-release-monorepo",
        "folder": "./plugins"
      }
    ],
    "publish": [
      {
        "path": "@khala/npm-release-monorepo",
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
    "prepare": "@khala/npm-release-monorepo",
    "publish": "@khala/npm-release-monorepo"
  }
}
```
