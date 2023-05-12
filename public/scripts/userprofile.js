var userData = document.currentScript.getAttribute('userData');
// userData = JSON.parse(userData);
console.log(userData)
console.log(typeof userData)
if(userData){
  var imageData = userData;
}else{
  var imageData = "";
}
// var imageData


function goTravelHistroy() {
  window.location.href = "/userprofile/travel_history";
}

function convertImgToBase64(file, callback) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    callback(reader.result);
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
  };
}

function uploadImage(e) {
  console.log(event.target.files[0])
  var imageUrl = URL.createObjectURL(event.target.files[0]);
  var elem = document.getElementById("imagePreviewHolder")
  elem.setAttribute("src", imageUrl)
  convertImgToBase64(event.target.files[0], function (base64) {
    imageData = base64;
  });
}

function submitForm() {
  var firstName = $("#firstNameInput").val();
  var lastName = $("#lastNameInput").val();
  var email = $("#emailInput").val();
  var homeCity = $("#homeCityInput").val();

  const data = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    homeCity: homeCity,
    avatar: imageData
  }

  const urlEncodedData = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    urlEncodedData.append(key, value);
  }

  fetch('/editProfile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: urlEncodedData
  })
    .then(response => {
      console.log(response)
      if(!response.ok){
        alert("Network response failed");
      }else{
        return response.json();
      }
    })
    .then(data => {
      console.log(data); // do something with the JSON response
      location.reload()
      // document.getElementById("userAvatar").setAttribute("src", data.profilePic);
      // document.getElementsByClassName("username")[0].innerHTML = data.firstName + " " + data.lastName;
      // document.getElementById("userHome").innerHTML = data.homeCity;
      

    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function goCreateGroup(){
    window.location.href = "/creategroup";
}
function goGroupDetails(){
    window.location.href = "/userprofile/groupdetails";
}