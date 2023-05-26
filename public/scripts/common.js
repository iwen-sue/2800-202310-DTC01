// this file includes common functions we need for all pages

// for navs
/* Set the width of the side navigation to 200px */

/**
 * open the side navigation.
 */
function openNav() {
    document.getElementById("mySidenav").style.width = "200px";
}

/* Set the width of the side navigation to 0 */
/**
 * close the side navigation.
 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

/**
 * setup event for back button.
 */
function back() {
    window.history.back();
}