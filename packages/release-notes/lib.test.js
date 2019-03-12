const { getCurrDate, releaseType, patterns, findPackages } = require('./lib');

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
})
