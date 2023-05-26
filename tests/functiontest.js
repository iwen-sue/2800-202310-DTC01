/**
 * Check if the given input is alphanumeric.
 * Source: ChatGPT
 * @param {any} inputString - The input string to check
 * @returns {boolean} - True if the input string is alphanumeric, false otherwise
 */
function isAlphanumeric(inputString) {
    const pattern = /^[a-zA-Z0-9]+$/;
    return pattern.test(inputString);
}

/**
 * Check if the given token is valid; i.e. 24 characters long and only contains alphanumeric characters.
 * @param {any} token - The token to check
 * @returns {boolean} - True if the token is valid, false otherwise
 */
function validateToken(token) {
    return token.length == 24 && isAlphanumeric(token);
}
module.exports = validateToken;