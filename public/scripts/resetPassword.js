setTimeout(function() {
    var alertBox = document.getElementById('alertBox');
    if (alertBox) {
        alertBox.parentNode.removeChild(alertBox);
    }
}, 3000);