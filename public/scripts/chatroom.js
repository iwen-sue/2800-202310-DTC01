
var groupName = document.currentScript.getAttribute('groupName');
var userName = document.currentScript.getAttribute('userName');
var profilePic = document.currentScript.getAttribute('profilePic');
var groupID = document.currentScript.getAttribute('groupID');
var userID = document.currentScript.getAttribute('userID');
// console.log(profilePic)
// profilePic = compressBase64(profilePic);
// console.log(profilePic)

const socket = io();

function setup() {
    var viewHeight = window.innerHeight - 95;
    let elem = document.getElementById("chatRoomView");
    elem.setAttribute("style", `height:${viewHeight}px`);
    const msgBtn = document.getElementById("msgBtn");

    socket.emit('joinedRoom', { userName, groupID });


    socket.emit('chatHistory', groupID);

    msgBtn.addEventListener('click', (e) => {
        const msg = $("#msg").val()

        var timeStp = new Date();
        console.log("timeStp: ", timeStp);
        //emit message to server
        socket.emit('chatMessage', { msg, groupID, userID, userName, timeStp, profilePic });

        //clear input after sent
        const inputElement = document.getElementById('msg');
        inputElement.value = '';
        inputElement.focus();
    })
}

function sendNotification(message) {
    let elem = document.createElement("div");
    elem.setAttribute("class", "chatNotification");
    elem.innerHTML = message
    document.getElementById("chatRoomView").append(elem)
}

function getTime(today){
    var month = Number(today.getMonth())+1;
    if(month>9){
        month = '0' + String(month)
    }else{
        month = String(month)
    }
    return today.getFullYear() + '/' + month + '/' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes();
}

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}


function insertMessage(msg, userName, time, userImg) {
    // console.log(userImg)
    // const blob = new Blob([userImg]);
    // const dataURL = URL.createObjectURL(blob);
    // const binary = String.fromCharCode.apply(null, new Uint8Array(userImg));
    // const base64 = btoa(binary);
    // userImg = arrayBufferToBase64(userImg)
    // const blob = new Blob([userImg]);
    // const url = URL.createObjectURL(blob);





    const dateInfo = new Date(time);
    var messageElem = document.getElementsByClassName('chatMessageBox')[0];

    var messageCard = messageElem.content.cloneNode(true);
    // if (userImg) {
    //     messageCard.querySelector('.messageImage').setAttribute("src", "data:image/png;base64," + userImg);
    //     // messageCard.querySelector('.messageImage').setAttribute("src", dataURL)
    // }


    messageCard.querySelector('.messagerName').innerHTML = userName;
    messageCard.querySelector('.messagerTime').innerHTML = getTime(dateInfo);
    messageCard.querySelector('.chatMessageText').innerHTML = msg;
    document.getElementById("chatRoomView").append(messageCard);

    //set Sroll to Bottom
    var scrollNum = document.getElementById("chatRoomView").scrollHeight
    window.scrollTo(0, scrollNum);

}

function retrieveChatHistory(messageHistory) {
    console.log(messageHistory); // Check the entire messageHistory array

    messageHistory.forEach((message) => {
        console.log(message); // Check each individual message object

        // Use the correct property name 'message'
        const { message: msg, userName, timeStamp, profilePic } = message;

        insertMessage(msg, userName, timeStamp, profilePic);
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
socket.on('chatMessage', ({ userName, msg, timeStp, userImg }) => {
    // console.log(chatMessage);
    insertMessage(msg, userName, timeStp, userImg);


});




setup()


function compressBase64(base64Image) {
    // Assuming you have the base64 image data as 'base64Image'

    // Create an HTMLImageElement
    const img = new Image();

    // Set the source of the image to the base64 data
    img.src = 'data:image/png;base64,' + base64Image;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set the desired width and height for the compressed image
    const maxWidth = 100;
    const maxHeight = 100;

    // Ensure the image is loaded before manipulating it
    img.onload = function () {
        // Calculate the new dimensions while maintaining the aspect ratio
        let newWidth = img.width;
        let newHeight = img.height;

        if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = Math.floor((newWidth * img.height) / img.width);
        }

        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = Math.floor((newHeight * img.width) / img.height);
        }

        // Set the canvas dimensions to the new dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the image on the canvas with the new dimensions
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Get the compressed base64 image data from the canvas
        const compressedBase64 = canvas.toDataURL('image/png', 0.8);

        // Use the compressed base64 data as needed
        return compressedBase64
    };
}