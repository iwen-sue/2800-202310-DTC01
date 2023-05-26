/**
 * Check if the given input is alphanumeric
 * Source: ChatGPT
 * @param {any} inputString - The input string to check
 * @returns {boolean} - True if the input string is alphanumeric, false otherwise
 */
function isAlphanumeric(inputString) {
    const pattern = /^[a-zA-Z0-9]+$/;
    return pattern.test(inputString);
}

/**
 * Check if the given token is valid; i.e. 24 characters long and only contains alphanumeric characters
 * @param {any} token - The token to check
 * @returns {boolean} - True if the token is valid, false otherwise
 */
function validateToken(token) {
    return token.length == 24 && isAlphanumeric(token);    
}

$(document).ready(function () {
    $("#joinBtn").click(function (e) {
        var groupToken = $("#groupToken").val().trim();
        if (groupToken == "") {
            e.preventDefault();
            swal("Please enter a group token.");
            return;
        }
        if (!validateToken(groupToken)) {
            e.preventDefault();
            swal("The token must be 24 characters long and contain only alphanumeric characters.");
        }
    });
});