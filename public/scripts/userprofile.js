

var imageData = document.currentScript.getAttribute('imageData');

if(imageData){
  var imageData = imageData;
}else{
  var imageData = "";
}

/**
 * define the click event behavior of travel history
 */
function goTravelHistroy() {
  window.location.href = "/userprofile/travelHistory";
}

/**
 * define the upload image behavior.
 */
function uploadImage() {
  imageData = event.target.files[0]
  var imageUrl = URL.createObjectURL(imageData);
  var elem = document.getElementById("imagePreviewHolder")
  elem.setAttribute("src", imageUrl)
}

/**
 * gather all user inputs and submit it to backend.
 */
function submitForm() {
  var firstName = $("#firstNameInput").val().replace(/\s/g, "");
  var lastName = $("#lastNameInput").val().replace(/\s/g, "");
  var email = $("#emailInput").val();
  var homeCity = $("#homeCityInput").val();
  var formData = new FormData();

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

/**
 * define create group click event behavior.
 */
function goCreateGroup(){
    window.location.href = "/creategroup";
}

/**
 * define view group click event behavior.
 */
function goGroupDetails(){
    window.location.href = "/userprofile/groupdetails";
}