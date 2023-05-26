var groupName = document.currentScript.getAttribute('groupName');
var userName = document.currentScript.getAttribute('userName');
var profilePic = document.currentScript.getAttribute('profilePic');
var groupID = document.currentScript.getAttribute('groupID');
var userID = document.currentScript.getAttribute('userID');
var userEmail = document.currentScript.getAttribute('userEmail');
var fileData = new Object();
fileData.name = ""

if (!groupID) {
    swal("please join a travel group to start chat!")
    .then(() => {
        window.location.href = "/userprofile"
    })
}

const socket = io();

/**
 *  General setup that excutes regardless if user joined a group or not.
 */
function generalSetUp() {
    var viewHeight = window.innerHeight - 95;
    let elem = document.getElementById("chatRoomView");
    elem.setAttribute("style", `height:${viewHeight}px`);
}


/**
 * setup DOM if user joined a group
 */
function setup() {

    const msgBtn = document.getElementById("msgBtn");
    setTimeout(() => {
        var joinedRoomObj = new Object()
        joinedRoomObj.name = window.userName
        joinedRoomObj.groupID = window.groupID

        socket.emit('joinedRoom', joinedRoomObj);
    })

    socket.emit('chatHistory', groupID);

    msgBtn.addEventListener('click', () => {
        sendMission()
    })

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.code === "Enter") {
            sendMission()
        }
    });

    fetch('/chatroom/sentimentScores?id='+ groupID, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then(response => {
          return response.json()
        })
        .then(data => {
            const filteredSentiments = data.data.filter(memberSentiment => {
                return memberSentiment.email !== userEmail
            })
            setTimeout(()=>{
                filteredSentiments.forEach(memberSentiment =>{
                    setTimeout(()=>{
                        insertEmoji(memberSentiment, "off")
                    }, 2000)
                })
            })
          })
        .catch(error => {
          console.error('Error:', error);
        });
}

/**
 * Generate a unique ID by combining timestamp and random number
 * 
 * @returns {String} the unique ID value
 */
function generateUniqueID() {
    const randomNum = Math.floor(Math.random() * 10000); // Generate random number as a string
    // Combine timestamp and random number
    return randomNum;
}




/**
 * send the user input info to the backend following defined rule, user input is either string or a file.
 */
function sendMission() {
    const msg = $("#msg").val()
    const messageNM = generateUniqueID()

    if (msg) {
        var timeStp = new Date();

        //emit message to server
        var chatMessageObj = new Object();
        chatMessageObj.messageName = messageNM
        chatMessageObj.message = msg
        chatMessageObj.groupID = groupID
        chatMessageObj.userID = userID
        chatMessageObj.userName = userName
        chatMessageObj.timeStp = timeStp
        chatMessageObj.email = userEmail

        if (fileData.name == msg) {
            var formData = new FormData();
            formData.append("imageData", fileData);
            formData.append("groupID", groupID);

            fetch('/uploadImage', {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    // Handle the received JSON data
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

/**
 * send notification to the chatroom display
 * 
 * @param {String} message - message needs to display
 */
function sendNotification(message) {
    let elem = document.createElement("div");
    elem.setAttribute("class", "chatNotification");
    elem.innerHTML = message
    document.getElementById("chatRoomView").append(elem)
}


/**
 * format the date and time date in a defined rule.
 * 
 * @param {Date} today - the date date and time data that needs to format
 * @returns {String} - formatted time as a string
 */
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

/**
 * insert real time message to DOM tree to show the message sent by users dynamically.
 * 
 * @param {*} msg - text message or object info with image data stored in
 * @param {String} userName - the name of the user who sent this message
 * @param {String} time - the timestamp as a string
 * @param {String} email - the email detail
 * @param {String} msgName - message ID information
 */
function insertMessage(msg, userName, time, email, msgName) {

    const dateInfo = new Date(time);
    var messageElem = document.getElementsByClassName(email)[0];
    var messageCard = messageElem.content.cloneNode(true);
    messageCard.querySelector('.messagerName').innerHTML = userName;
    messageCard.querySelector('.messagerTime').innerHTML = getTime(dateInfo);
    messageCard.querySelector('.messageID').innerHTML = msgName;

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

/**
 * insert history message from the top of chatroom.
 * 
 * @param {String} userName - the name of the user who sent this message
 * @param {String} time - the timestamp as a string
 * @param {String} email - the email detail
 * @param {String} msgName - message ID information
 */
function insertMessageToTop(msg, userName, time, email, msgName) {

    const dateInfo = new Date(time);
    var messageElem = document.getElementsByClassName(email)[0];
    var messageCard = messageElem.content.cloneNode(true);
    messageCard.querySelector('.messagerName').innerHTML = userName;
    messageCard.querySelector('.messagerTime').innerHTML = getTime(dateInfo);
    messageCard.querySelector('.chatMessageText').innerHTML = msg;
    messageCard.querySelector('.messageID').innerHTML = msgName;
    document.getElementById("chatRoomView").prepend(messageCard);
}


/**
 * catch the message history array and insert them one by one to the chatroom DOM tree. 
 * 
 * @param {Array} messageHistory - message history as an array
 */
function retrieveChatHistory(messageHistory) {

    messageHistory.forEach(async (message) => {
        // if (typeof message.message != "string") {
        //     var arrImage = message.message.imageData.data
        //     base64Image = await arrayBufferToBase64(arrImage);
        //     message.message.imageData = base64Image
        // }

        insertMessage(message.message, message.userName, message.timeStp, message.email, message.messageName);
    });
}

/**
 * catch the message history array and insert them one by one to the chatroom DOM tree when load more history. 
 * 
 * @param {Array} messageHistory - message history as an array
 */
function retrieveChatHistoryToTop(messageHistory) {

    messageHistory.forEach((message) => {
        insertMessageToTop(message.message, message.userName, message.timeStp, message.email, message.messageName);
    });
}

var numOfScroll = 0;
var container = document.getElementById('container');

/**
 * adjust the scroll position and send load history request.
 */
function scrollTest() {
    if (container.scrollTop == 0) {
        numOfScroll += 1;
        socket.emit('moreChatHistory', groupID, numOfScroll);
        container.scrollTo(0, 50);
    }
}

container.addEventListener('scroll', scrollTest);


//prepare the chatroom environment when user joined a group
if (groupID) {
    //show chat history
    socket.on('chatHistory', (messageHistory) => {
        retrieveChatHistory(messageHistory);

    });



    //catch messages sent from backend and send it as notification in group chat
    socket.on('message', message => {
        sendNotification(message);
    })

    socket.on("sentimentScore", ({memberSentiment})=>{
        insertEmoji(memberSentiment, "on")
    })

    // show chat history
    socket.on('chatMessage', async ({ chatMessageObj }) => {
        if (typeof chatMessageObj.message != "string") {
            var arrImg = chatMessageObj.message.imageData.data
            base64Img = await arrayBufferToBase64(arrImg);
            chatMessageObj.message.imageData = base64Img
        }
        insertMessage(chatMessageObj.message, chatMessageObj.userName, chatMessageObj.timeStp, chatMessageObj.email, chatMessageObj.messageName);
    });

    socket.on('moreChatHistory', (messageHistory) => {
        retrieveChatHistoryToTop(messageHistory);

    });

    setup();
}

//set up delete message
const chatRoomView = document.getElementById('chatRoomView');
chatRoomView.addEventListener('click', function(event) {
    // Check if the clicked element has the delete-button class
    if (event.target.classList.contains('delete-button')) {
        const deleteButton = event.target;
        const chatMessageBoxTwo = deleteButton.closest('.chatMessageBoxTwo');
        const chatMessage = deleteButton.closest('.chatMessage');
        const messagerNameElement = chatMessageBoxTwo.querySelector('.messagerName');
        const messagerName = messagerNameElement.textContent.trim();
        const deleteBtn = chatMessageBoxTwo.querySelector('.delete-button');
        const timeStpElement = chatMessageBoxTwo.querySelector('.messagerTime');
        const timeStp = timeStpElement.textContent.trim();
        const chatMessageTextElement = chatMessageBoxTwo.querySelector('.chatMessageText');
        const chatMessageText = chatMessageTextElement.textContent.trim();

        if (userName != messagerName) {
            swal("You can only delete your own message!");
            deleteBtn.style.display = 'none';
        } else if (confirm('Are you sure you want to delete this message?')) {
            // Code to handle the delete action
            chatMessage.remove(); // Remove the entire chat message container
            socket.emit('deleteMessage', groupID, messagerName, chatMessageText);
        }
    }
});

generalSetUp()

/**
 * add the animated Emoji to the latest message icon for each user in this chatroom group
 * 
 * @param {Object} memberSentiment - contains all details of the emoji information
 * @param {String} ifNote - check if real time chat sentiment analysis notification needs to trigger, 'on' for yes
 */
function insertEmoji(memberSentiment, ifNote){
    
    var classStr = memberSentiment.email + "emoji";
    var elems = document.getElementsByClassName(classStr);
    for(var i=0; i<elems.length; i++){
        if(i == elems.length-1){
            if(memberSentiment.emoji == ""){
                elems[i].innerHTML = "&#x1F610;"
            }else{
                elems[i].innerHTML = memberSentiment.emoji;
            }
            elems[i].setAttribute("class", `${memberSentiment.email}emoji emojiIcon emojiAnimate`);

        }else{
            elems[i].innerHTML = ""
            elems[i].setAttribute("class", `${memberSentiment.email}emoji emojiIcon`);
        }
    }
    
    if(memberSentiment.suggestion!="" && ifNote=="on"){
        var elem = document.getElementsByClassName("aiSuggestion")[0]
        elem.innerHTML = memberSentiment.suggestion
        elem.setAttribute("class", "aiSuggestion");
        setTimeout(()=>{
            elem.setAttribute("class", "aiSuggestion aiSuggestionShow");
            setTimeout(()=>{
                elem.setAttribute("class", "aiSuggestion");
            }, 9500)
        }, 1500)
    }
}

/**
 * convert array buffer to base64 string form
 * 
 * @param {Array} buffer - array buffer needs to convert
 * @returns {String} - base64 string image data
 */
function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

/**
 * catch the image file user choooses under 5MB and write the name into input to notify user image is catched. 
 * 
 * @param {*} files - file data user chooses
 */
function upload(files) {
    fileData = files[0]
    const maxSizeInBytes = 300 * 1024; // 5 MB (adjust to your desired maximum size)
    if (fileData.size > maxSizeInBytes) {
        // File size exceeds the maximum limit
        swal('File size exceeds the maximum limit of 5 MB.');
        // fileInput.value = null; // Reset the file input
    } else {
        // write file name in text input
        document.getElementById('msg').value = fileData.name
    }
}