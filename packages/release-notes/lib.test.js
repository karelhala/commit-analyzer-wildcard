const { getCurrDate } = require('./lib');

test('should print correct date', () => {
  expect(getCurrDate().length).toBe(10);
});
