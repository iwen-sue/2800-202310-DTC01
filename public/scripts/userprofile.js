

var imageData = document.currentScript.getAttribute('imageData');

// userData = JSON.parse(userData);

console.log(typeof imageData)
if(imageData){
  var imageData = imageData;
}else{
  var imageData = "";
}



function goTravelHistroy() {
  window.location.href = "/userprofile/travelHistory";
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
  imageData = event.target.files[0]
  var imageUrl = URL.createObjectURL(imageData);
  var elem = document.getElementById("imagePreviewHolder")
  elem.setAttribute("src", imageUrl)
}

function submitForm() {
  var firstName = $("#firstNameInput").val().replace(/\s/g, "");
  var lastName = $("#lastNameInput").val().replace(/\s/g, "");
  var email = $("#emailInput").val();
  var homeCity = $("#homeCityInput").val();
  var formData = new FormData();
  var imageForm = new FormData();

  formData.append('avatar', imageData);
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);
  formData.append('email', email);
  formData.append('homeCity', homeCity);


  fetch('/editProfile', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      console.log(response)
      if(!response.status == 200){
        alert( response.statusText + ", with an error code" + response.status);
      }else{
        return response.json();
      }
    })
    .then(data => {
      console.log(data); // do something with the JSON response
      location.reload()
    })
}

function goCreateGroup(){
    window.location.href = "/creategroup";
}
function goGroupDetails(){
    window.location.href = "/userprofile/groupdetails";
}