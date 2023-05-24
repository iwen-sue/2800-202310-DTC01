var selectedCountry, selectedCities = [], readyToRemove;

$(document).ready(function () {
    $('#startPicker').datepicker({
        format: "yyyy-mm-dd"
    });

    $('#endPicker').datepicker({
        format: "yyyy-mm-dd"
    });

    $('#startPickerAdjust').datepicker({
        format: "yyyy-mm-dd"
    });

    $('#endPickerAdjust').datepicker({
        format: "yyyy-mm-dd"
    });

    $('.timepicker').timepicker({
        format: "HH:mm",
        showMeridian: false
    });

    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $(".dropdown-menu li").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $("#myCityInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $(".dropdown-city li").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });


    var countrySelect = document.getElementById('country');
    var citySelect = document.getElementById('city');

    // Fetch country data from the API
    fetch('https://countriesnow.space/api/v0.1/countries')
        .then(response => response.json())
        .then(data => {
            // Iterate over the country data and create country options
            console.log(countrySelect);
            data.data.forEach(info => {
                var option = document.createElement('li');
                // option.value = info.country;
                option.innerHTML = info.country;
                option.addEventListener('click', function (e) {
                    // Code to be executed when the li element is clicked
                    selectedCountry = e.target.innerHTML;
                    renderCities();
                    document.getElementById("selectedCountry").innerHTML = selectedCountry;
                });
                countrySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.log('Error:', error);
        });

    function renderCities() {
        fetch('https://countriesnow.space/api/v0.1/countries')
            .then(response => response.json())
            .then(data => {
                // Iterate over the city data and create city options
                data.data.forEach(country => {
                    if (country.country === selectedCountry) {
                        country.cities.forEach(city => {
                            var option = document.createElement('li');
                            option.innerHTML = city;
                            option.addEventListener('click', function (e) {
                                // Code to be executed when the li element is clicked
                                var span = document.createElement('span');
                                span.classList.add('cityItem');
                                span.textContent = e.target.innerHTML;

                                span.addEventListener('click', handleCityClick);

                                console.log(e.target.innerHTML);
                                selectedCities.push(e.target.innerHTML)
                                document.getElementById("selectedCities").appendChild(span);
                                
                                
                            });
                            citySelect.appendChild(option);
                        });
                    }

                });
            })
            .catch(error => {
                console.log('Error:', error);
            });

    }
});

function handleCityClick(e) {
    readyToRemove = e.target
    console.log(readyToRemove)

    $("#confirmModal").modal("show")
}

function deleteFromArray(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }

function deleteCity(){
    readyToRemove.remove();
    var text = readyToRemove.innerHTML;
    deleteFromArray(selectedCities, text);
    console.log(selectedCities);
    $("#confirmModal").modal("hide");
}

function submitForm() {
    var startDate = document.getElementById("startDateValue").value;
    var endDate = document.getElementById("endDateValue").value;
    var startTime = document.getElementById("startTimeValue").value;
    var endTime = document.getElementById("endTimeValue").value;
    console.log(selectedCities)
    
    if(startDate!="" && endDate!="" && startTime!="" && endTime!="" && selectedCountry!=undefined && selectedCities!=[]){
        if(convertTime(endDate)>=convertTime(startDate) && convertTime(endTime)>convertTime(startTime)){
            var postData = {
                'startDate': startDate,
                'endDate': endDate,
                'startTime': startTime,
                'endTime': endTime,
                'country': selectedCountry,
                'cities': JSON.stringify(selectedCities)
            }
            fetch('/itinerary/submitNew', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(postData)
            })
                .then(response => response.json())
                .then(data => {
                    // Handle the response from the backend
                    console.log(data);
                })
                .catch(error => {
                    // Handle any errors
                    console.error(error);
                });
        }else{
            alert("start time/ date can not be later than end time/date!")
        }
        
        
    }else{
        alert("please select all fields!")
    }




    

}

function getRecommendations() {
    var startDate = document.getElementById("startDateValue").value
    if (startDate) {
        var postData = {
            'startDate': startDate
        }
        fetch('/itinerary/getRecommendation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(postData)
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the backend
                console.log(data);
            })
            .catch(error => {
                // Handle any errors
                console.error(error);
            });

    } else {
        alert("please select a startDate to get advices from AI!")
    }
}

function convertTime(timeStr){
    return new Date(timeStr);
}

function submitAdjustDates() {
    var startDate = document.getElementById("startPickerAdjustValue").value
    var endDate = document.getElementById("endPickerAdjustValue").value
    if (startDate != "" && endDate != "") {
        if(convertTime(endDate)>=convertTime(startDate)){
            var postData = {
                'startDate': startDate,
                'endDate': endDate
            }
            fetch('/itinerary/adjustment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(postData)
            })
                .then(response => response.json())
                .then(data => {
                    // Handle the response from the backend
                    console.log(data);
                })
                .catch(error => {
                    // Handle any errors
                    console.error(error);
                });
        }else{
            //alert that starte date can not be latter than end Date
            alert("Please ensure the start date is ealier or equal to the end date!")
        }
        
    } else {
        alert("please select all fields!")
    }


}