
var userName = document.currentScript.getAttribute('userName');
var profilePic = document.currentScript.getAttribute('profilePic');

console.log(userName)

const socket = io();

function setup(){
    var viewHeight = window.innerHeight - 95;
    let elem = document.getElementById("chatRoomView");
    elem.setAttribute("style", `height:${viewHeight}px`);
    const msgBtn = document.getElementById("msgBtn");

    msgBtn.addEventListener('click', (e)=>{
        const msg = $("#msg").val()

        //emit message to server
        socket.emit('chatMessage', msg);

    })
}

function sendNotification(message){
    let elem = document.createElement("div");
    elem.setAttribute("class", "chatNotification");
    elem.innerHTML = message
    document.getElementById("chatRoomView").append(elem)
}

function getTime(){
    var today = new Date();
    return today.getFullYear() + '/' + Number(today.getMonth())+1 + '/' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes();
}

//catch messages sent from backend and send it as notification in group chat
socket.on('message',message=>{
    sendNotification(message);
})

socket.on('chatMessage',chatMessage=>{
    // console.log(chatMessage);

    var messageElem = document.getElementsByClassName('chatMessageBox')[0];

    var messageCard = messageElem.content.cloneNode(true);
    if(profilePic){
        messageCard.querySelector('.messageImage').setAttribute("src", profilePic);
    }
    
    messageCard.querySelector('.messagerName').innerHTML = userName;
    messageCard.querySelector('.messagerTime').innerHTML = getTime();

    messageCard.querySelector('.chatMessageText').innerHTML = chatMessage;
    document.getElementById("chatRoomView").append(messageCard)
})

setup()

