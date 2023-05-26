const validateToken = require('./functiontest.js');

test('validateToken returns true for a valid token', () => {
    expect(validateToken("646d3d4b0c69cfaf6ad6f2fd")).toBe(true);
});

test('validateToken returns false for an invalid token', () => {
    expect(validateToken("hello // there")).toBe(false);
});