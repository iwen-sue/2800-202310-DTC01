
var groupName = document.currentScript.getAttribute('groupName');
var userName = document.currentScript.getAttribute('userName');
var profilePic = document.currentScript.getAttribute('profilePic');
var groupID = document.currentScript.getAttribute('groupID');
var userID = document.currentScript.getAttribute('userID');
var userEmail = document.currentScript.getAttribute('userEmail');
var fileData;

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

    msgBtn.addEventListener('click', (e) => {
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


    })
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

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
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

        var imageData = msg.imageData.data
        console.log(imageData)
        console.log("image data type is ", typeof imageData)

        // Assuming imageData is an array of image data chunks

        const blob = new Blob(imageData);

        // Create a FileReader object
        const reader = new FileReader();

        // Define the onload event handler for the FileReader
        reader.onload = function () {
            const localURL = reader.result;
            console.log(localURL);

            // Use the local URL here or pass it to another function
            messageCard.querySelector('.chatMessageText').innerHTML = `<img class="clientImage" src="${localURL}" />`;
        };

        // Read the Blob as Data URL
        reader.readAsDataURL(blob);








    }
    
        document.getElementById("chatRoomView").append(messageCard);
    


    //set Sroll to Bottom
    var scrollNum = document.getElementById("chatRoomView").scrollHeight
    window.scrollTo(0, scrollNum);

}

function retrieveChatHistory(messageHistory) {
    console.log(messageHistory); // Check the entire messageHistory array

    messageHistory.forEach((message) => {
        console.log(message); // Check each individual message object



        insertMessage(message.message, message.userName, message.timeStp, message.email);
    });
}

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
    socket.on('chatMessage', ({ chatMessageObj }) => {
        // console.log(chatMessage);
        insertMessage(chatMessageObj.message, chatMessageObj.userName, chatMessageObj.timeStp, chatMessageObj.email);


    });

    setup();

}

generalSetUp()

function upload(files) {
    fileData = files[0]

    // write file name in text input
    document.getElementById('msg').value = fileData.name


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