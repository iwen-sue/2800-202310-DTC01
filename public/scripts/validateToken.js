function isAlphanumeric(inputString) {
    // Source: ChatGPT
    // Regular expression pattern to match alphanumeric characters
    const pattern = /^[a-zA-Z0-9]+$/;

    // Test if the input string matches the pattern
    return pattern.test(inputString);
}

function validateToken(token) {
    // Check if the given token is 24 characters long and only contains alphanumeric characters
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