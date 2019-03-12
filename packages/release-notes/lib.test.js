const {
  getCurrDate, releaseType, patterns, findPackages, groupMessages, pckgName, generateMessage,
} = require('./lib');

test('should print correct date', () => {
  expect(getCurrDate().length).toBe(10);
});

describe('message type', () => {
  test('No release', () => {
    const release = releaseType({ message: 'Some text <no>' }, patterns);
    expect(release).toBe(null);
  });

  test('No wildcard', () => {
    const release = releaseType({ message: 'Some text' }, patterns);
    expect(release).toBe(2);
  });

  test('Bugfix wildcard', () => {
    const release = releaseType({ message: 'Some text <?.?.x>' }, patterns);
    expect(release).toBe(2);
  });

  test('Minor wildcard', () => {
    const release = releaseType({ message: 'Some text <?.x.x>' }, patterns);
    expect(release).toBe(1);
  });

  test('Major wildcard', () => {
    const release = releaseType({ message: 'Some text <x.?.x>' }, patterns);
    expect(release).toBe(0);
  });
});


describe('Find packages', () => {
  test('root folder', async () => {
    const packages = await findPackages('.');
    expect(packages.length).toBe(4);
    expect(packages).toContain('packages/release-notes');
    expect(packages).toContain('packages/npm-release');
    expect(packages).toContain('packages/commit-analyzer');
  });

  test('packages folder', async () => {
    const packages = await findPackages('./packages');
    expect(packages.length).toBe(3);
    expect(packages).toContain('packages/release-notes');
    expect(packages).toContain('packages/npm-release');
    expect(packages).toContain('packages/commit-analyzer');
  });
});

describe('Group messages', () => {
  const packages = ['packages/commit-analyzer',
    'packages/npm-release',
    'packages/release-notes'];

  const commit = {
    message: 'Some message',
    hash: 'ce7da317e',
  };

  test('should group packages to message', async () => {
    const groupped = await groupMessages(packages, commit);
    expect(Object.keys(groupped).length).toBe(2);
    expect(Object.keys(groupped)).toContain('packages/release-notes');
    expect(Object.keys(groupped)).toContain('packages/commit-analyzer');
    expect(groupped['packages/release-notes']).toBe('Some message');
    expect(groupped['packages/commit-analyzer']).toBe('Some message');
  });
});

test('Should get pckg name', async () => {
  const pckg = await pckgName('commit-analyzer', '..');
  expect(pckg).toBe('@khala/commit-analyzer-wildcard');
});

test('Should generate correct message', async () => {
  const changes = {
    'release-notes': [
      'One message',
    ],
    'commit-analyzer': [
      'Other message',
    ],
  };
  const msg = await generateMessage(changes, '..', '1.0.0');
  expect(msg).toContain(' * One message');
  expect(msg).toContain(' * Other message');
  expect(msg).toContain('### [@khala/wildcard-release-notes~1.0.0](https://www.npmjs.com/package/@khala/wildcard-release-notes/v/1.0.0)');
  expect(msg).toContain('### [@khala/commit-analyzer-wildcard~1.0.0](https://www.npmjs.com/package/@khala/commit-analyzer-wildcard/v/1.0.0)');
});
