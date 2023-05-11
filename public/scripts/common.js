// this file includes common functions we need for all pages

// for navs
/* Set the width of the side navigation to 250px */

function openNav() {
    document.getElementById("mySidenav").style.width = "200px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function logout(){
    window.location.href = "/logout"
}

function setup() {
    console.log("setup!");
    
    // for navs
    
}

$(document).ready(setup);
