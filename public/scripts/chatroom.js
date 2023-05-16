
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

        //emit message object {username, image, message} to server
        var messageObj = new Object();
        messageObj.username = userName;
        messageObj.image = profilePic;
        messageObj.message = msg
        socket.emit('chatMessage', messageObj);

        //clear input after sent
        const inputElement = document.getElementById('msg');
        inputElement.value = '';
        inputElement.focus();

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
    var month = Number(today.getMonth())+1;
    if(month>9){
        month = '0' + String(month)
    }else{
        month = String(month)
    }
    return today.getFullYear() + '/' + month + '/' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes();
}

//catch messages sent from backend and send it as notification in group chat
socket.on('message',message=>{
    sendNotification(message);
})

socket.on('chatMessage',chatMessage=>{
    // chat message object {username, image, message}

    var messageElem = document.getElementsByClassName('chatMessageBox')[0];

    var messageCard = messageElem.content.cloneNode(true);
    if(profilePic){
        messageCard.querySelector('.messageImage').setAttribute("src", chatMessage.image);
    }
    
    messageCard.querySelector('.messagerName').innerHTML = chatMessage.username;
    messageCard.querySelector('.messagerTime').innerHTML = getTime();

    messageCard.querySelector('.chatMessageText').innerHTML = chatMessage.message;
    document.getElementById("chatRoomView").append(messageCard);

    //set Sroll to Bottom
    var scrollNum = document.getElementById("chatRoomView").scrollHeight
    window.scrollTo(0, scrollNum);
})

setup()

