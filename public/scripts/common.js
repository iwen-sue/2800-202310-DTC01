// this file includes common functions we need for all pages

// for headers and navs
/* Set the width of the side navigation to 250px */

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function setup() {
    console.log("setup!");
    $(".div").click(function () {
        console.log("div clicked!");
        closeNav();
    });
}

$(document).ready(setup);