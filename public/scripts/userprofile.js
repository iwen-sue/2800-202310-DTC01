var imageData;

function goTravelHistroy() {
    window.location.href = "/userprofile/travel_history";
}

function uploadImage(e) {
    console.log(event.target.files[0])
    var imageUrl = URL.createObjectURL(event.target.files[0]);
    var elem = document.getElementById("imagePreviewHolder")
    elem.setAttribute("src", imageUrl)
    imageData = event.target.files[0];
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