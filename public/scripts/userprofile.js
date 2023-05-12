var imageData;

function goTravelHistroy() {
    window.location.href = "/userprofile/travel_history";
}

function convertImgToBase64(file, callback) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      callback(reader.result);
    };
    reader.onerror = function(error) {
      console.log('Error: ', error);
    };
  }

function uploadImage(e) {
    console.log(event.target.files[0])
    var imageUrl = URL.createObjectURL(event.target.files[0]);
    var elem = document.getElementById("imagePreviewHolder")
    elem.setAttribute("src", imageUrl)
    convertImgToBase64(event.target.files[0], function(base64) {
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
}