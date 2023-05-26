setTimeout(function() {
    //trigger resend password behaviors
    var alertBox = document.getElementById('alertBox');
    if (alertBox) {
        alertBox.parentNode.removeChild(alertBox);
    }
}, 3000);