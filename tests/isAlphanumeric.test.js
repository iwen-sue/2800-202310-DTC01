const isAlphanumeric = require('./functiontest.js');

test('isAlphanumeric returns true for an alphanumeric string', () => {
    expect(isAlphanumeric("646d3d4b0c70cfaf6ad6f2fd")).toBe(true);
});

test('isAlphanumeric returns false for a non-alphanumeric string', () => {
    expect(isAlphanumeric("good // bye")).toBe(false);
});
