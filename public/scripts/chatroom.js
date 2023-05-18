
var groupName = document.currentScript.getAttribute('groupName');
var userName = document.currentScript.getAttribute('userName');
var profilePic = document.currentScript.getAttribute('profilePic');
var groupID = document.currentScript.getAttribute('groupID');
var userID = document.currentScript.getAttribute('userID');
var userEmail = document.currentScript.getAttribute('userEmail');
var fileData = new Object();
fileData.name = ""
// profilePic = compressBase64(profilePic);
// console.log(profilePic)

if (!groupID) {
    alert("please join a travel group to start chat!")
    window.location.href = "/userprofile"
}

const socket = io();

function generalSetUp() {
    var viewHeight = window.innerHeight - 95;
    let elem = document.getElementById("chatRoomView");
    elem.setAttribute("style", `height:${viewHeight}px`);
}

function setup() {

    const msgBtn = document.getElementById("msgBtn");

    socket.emit('joinedRoom', { userName, groupID });


    socket.emit('chatHistory', groupID);

    msgBtn.addEventListener('click', () => {
        sendMission()
    })

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.code === "Enter") {
            sendMission()
        }
    });
}

function sendMission() {
    const msg = $("#msg").val()

    if (msg) {
        var timeStp = new Date();

        //emit message to server
        console.log(userEmail)
        var chatMessageObj = new Object();
        chatMessageObj.message = msg
        chatMessageObj.groupID = groupID
        chatMessageObj.userID = userID
        chatMessageObj.userName = userName
        chatMessageObj.timeStp = timeStp
        chatMessageObj.email = userEmail




        if (fileData.name == msg) {
            console.log('ready to push file')
            var formData = new FormData();
            formData.append("imageData", fileData);
            formData.append("groupID", groupID);

            fetch('/uploadImage', {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    console.log(response)
                    return response.json()
                })
                .then(data => {
                    // Handle the received JSON data
                    console.log(data)
                    chatMessageObj.message = { imageData: data.imageData }
                    socket.emit('chatMessage', chatMessageObj);
                })

        } else {
            socket.emit('chatMessage', chatMessageObj);
        }

        //clear input after sent
        const inputElement = document.getElementById('msg');
        inputElement.value = '';
        inputElement.focus();


    }
}

function sendNotification(message) {
    let elem = document.createElement("div");
    elem.setAttribute("class", "chatNotification");
    elem.innerHTML = message
    document.getElementById("chatRoomView").append(elem)
}

function getTime(today) {
    var month = Number(today.getMonth()) + 1;
    var mins = Number(today.getMinutes())
    month = organiseTime(month)
    mins = organiseTime(mins)

    function organiseTime(num) {
        if (num < 10) {
            num = '0' + String(num)
        } else {
            num = String(num)
        }
        return num
    }

    return today.getFullYear() + '/' + month + '/' + today.getDate() + ' ' + today.getHours() + ":" + mins;
}




function insertMessage(msg, userName, time, email) {
    console.log(time)
 
    const dateInfo = new Date(time);
    var messageElem = document.getElementsByClassName(email)[0];

    var messageCard = messageElem.content.cloneNode(true);
    // if (userImg) {
    //     messageCard.querySelector('.messageImage').setAttribute("src", "data:image/png;base64," + userImg);
    //     // messageCard.querySelector('.messageImage').setAttribute("src", dataURL)
    // }
    messageCard.querySelector('.messagerName').innerHTML = userName;
    messageCard.querySelector('.messagerTime').innerHTML = getTime(dateInfo);
    console.log(typeof msg)
    if (typeof msg == 'string') {
        messageCard.querySelector('.chatMessageText').innerHTML = msg;
    } else {



        messageCard.querySelector('.chatMessageText').innerHTML = `<img class="clientImage" src="data:image/png;base64,${msg.imageData}" />`;

    }

    document.getElementById("chatRoomView").append(messageCard);



    //set Sroll to Bottom
    var container = document.getElementById("container");
    container.scrollTop = container.scrollHeight;

    //adjust parent element height when there is an image element inserted
    setTimeout(() => {
        if (typeof msg != 'string') {
            var elems = document.getElementsByClassName("clientImage");
            var elem = elems[elems.length - 1]
            let imgHeight = elem.offsetHeight;
            var parents = document.getElementsByClassName("chatMessage");
            var parent = parents[parents.length - 1]
            parent.setAttribute("style", `height:${90 + imgHeight}px`)
        }

    })
}

function insertMessageToTop(msg, userName, time, email) {
    console.log(time)
 
    const dateInfo = new Date(time);
    var messageElem = document.getElementsByClassName(email)[0];

    var messageCard = messageElem.content.cloneNode(true);
    // if (userImg) {
    //     messageCard.querySelector('.messageImage').setAttribute("src", "data:image/png;base64," + userImg);
    //     // messageCard.querySelector('.messageImage').setAttribute("src", dataURL)
    // }
    messageCard.querySelector('.messagerName').innerHTML = userName;
    messageCard.querySelector('.messagerTime').innerHTML = getTime(dateInfo);
    messageCard.querySelector('.chatMessageText').innerHTML = msg;
    document.getElementById("chatRoomView").prepend(messageCard);

    


}

function retrieveChatHistory(messageHistory) {
    console.log(messageHistory); // Check the entire messageHistory array

    messageHistory.forEach(async (message) => {
        console.log(message); // Check each individual message object
        if (typeof message.message != "string") {
            var arrImage = message.message.imageData.data
            base64Image = await arrayBufferToBase64(arrImage);
            message.message.imageData = base64Image
        }


        insertMessage(message.message, message.userName, message.timeStp, message.email);
    });
}

function retrieveChatHistoryToTop(messageHistory) {
    console.log(messageHistory); // Check the entire messageHistory array

    messageHistory.forEach((message) => {
        insertMessageToTop(message.message, message.userName, message.timeStp, message.email);
    });
}

var numOfScroll = 0;
var container = document.getElementById('container');


function scrollTest() {
    console.log(container.scrollTop);
    
    if (container.scrollTop == 0) {
      console.log("Scroll bar reached the top of the page!");
      numOfScroll += 1;
      console.log(numOfScroll);
      socket.emit('moreChatHistory', groupID, numOfScroll);
      container.scrollTo(0, 50);
    }

  }


container.addEventListener('scroll', scrollTest);






//Socket events
if (groupID) {
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
    socket.on('chatMessage', async ({ chatMessageObj }) => {
        // console.log(chatMessage);
        if (typeof chatMessageObj.message != "string") {
            var arrImg = chatMessageObj.message.imageData.data
            base64Img = await arrayBufferToBase64(arrImg);
            chatMessageObj.message.imageData = base64Img
        }
        insertMessage(chatMessageObj.message, chatMessageObj.userName, chatMessageObj.timeStp, chatMessageObj.email);
    });

    socket.on('moreChatHistory', (messageHistory) => {
        console.log("message History", messageHistory);
        retrieveChatHistoryToTop(messageHistory);
        
    });

    setup();

}



generalSetUp()

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}


function upload(files) {
    fileData = files[0]
    const maxSizeInBytes = 300 * 1024; // 5 MB (adjust to your desired maximum size)
    console.log(fileData)
    if (fileData.size > maxSizeInBytes) {
        // File size exceeds the maximum limit
        alert('File size exceeds the maximum limit of 5 MB.');
        // fileInput.value = null; // Reset the file input
    } else {
        // write file name in text input
        document.getElementById('msg').value = fileData.name

    }




}


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