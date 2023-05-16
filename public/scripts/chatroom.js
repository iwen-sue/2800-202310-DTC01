var groupName = document.currentScript.getAttribute('groupName');
var userName = document.currentScript.getAttribute('userName');
var profilePic = document.currentScript.getAttribute('profilePic');
var groupID = document.currentScript.getAttribute('groupID');
var userID = document.currentScript.getAttribute('userID');

console.log("userID: " + userID);
console.log("groupName: ", groupName)
console.log("username", userName)
console.log("groupID: ", groupID)

const socket = io();

function setup() {
    var viewHeight = window.innerHeight - 95;
    let elem = document.getElementById("chatRoomView");
    elem.setAttribute("style", `height:${viewHeight}px`);
    const msgBtn = document.getElementById("msgBtn");




    socket.emit('chatHistory', groupID);

    msgBtn.addEventListener('click', (e) => {
        const msg = $("#msg").val()

        var today = new Date();
        var timeStp =
            today.getFullYear() +
            '/' +
            (today.getMonth() + 1) +
            '/' +
            today.getDate() +
            ' ' +
            today.getHours() +
            ':' +
            today.getMinutes();

        console.log("timeStp: ", timeStp);
        //emit message to server
        socket.emit('chatMessage', { msg, groupID, userID, userName, timeStp });


    })
}

function sendNotification(message) {
    let elem = document.createElement("div");
    elem.setAttribute("class", "chatNotification");
    elem.innerHTML = message
    document.getElementById("chatRoomView").append(elem)
}

// function getTime() {
//     var today = new Date();
//     return today.getFullYear() + '/' + (Number(today.getMonth()) + 1) + '/' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes();
// }


function insertMessage(msg, userName, time) {
    var messageElem = document.getElementsByClassName('chatMessageBox')[0];

    var messageCard = messageElem.content.cloneNode(true);
    if (profilePic) {
        messageCard.querySelector('.messageImage').setAttribute("src", profilePic);
    }


    messageCard.querySelector('.messagerName').innerHTML = userName;
    messageCard.querySelector('.messagerTime').innerHTML = time;
    messageCard.querySelector('.chatMessageText').innerHTML = msg;
    document.getElementById("chatRoomView").append(messageCard)
    
}

function retrieveChatHistory(messageHistory) {
    console.log(messageHistory); // Check the entire messageHistory array

    messageHistory.forEach((message) => {
        console.log(message); // Check each individual message object

        // Use the correct property name 'message'
        const { message: msg, userName, timeStamp } = message;
        console.log(msg); // Check the 'message' property
        console.log(userName); // Check the 'userName' property
        console.log(timeStamp); // Check the 'timeStp' property

        insertMessage(msg, userName, timeStamp);
    });
}

//Socket events

//show chat history
socket.on('chatHistory', (messageHistory) => {
    console.log("message History", messageHistory);
    retrieveChatHistory(messageHistory);
});



//catch messages sent from backend and send it as notification in group chat
socket.on('message', message => {
    sendNotification(message);
})

// show chat history
socket.on('chatMessage', ({ userName, msg, timeStp }) => {
    // console.log(chatMessage);
    insertMessage(msg, userName, timeStp);

});




setup()

