var groupName = document.currentScript.getAttribute('groupName');

var selectedCountry, selectedCities = [], readyToRemove, deleteSchedule, targetDate, referStartTime;
const recommendedTrips = [
    { Place: "London, United Kingdom", AverageDuration: 7 },
    { Place: "Phuket, Thailand", AverageDuration: 6 },
    { Place: "Bali, Indonesia", AverageDuration: 8 },
    { Place: "New York City, United States", AverageDuration: 7 },
    { Place: "Tokyo, Japan", AverageDuration: 8 },
    { Place: "Paris, France", AverageDuration: 7 },
    { Place: "Sydney, Australia", AverageDuration: 9 },
    { Place: "Rio de Janeiro, Brazil", AverageDuration: 8 },
    { Place: "Amsterdam, Netherlands", AverageDuration: 7 },
    { Place: "Dubai, United Arab Emirates", AverageDuration: 7 },
    { Place: "Cancun, Mexico", AverageDuration: 8 },
    { Place: "Barcelona, Spain", AverageDuration: 7 },
    { Place: "Honolulu, Hawaii", AverageDuration: 9 },
    { Place: "Berlin, Germany", AverageDuration: 9 },
    { Place: "Marrakech, Morocco", AverageDuration: 7 },
    { Place: "Edinburgh, Scotland", AverageDuration: 7 },
    { Place: "Rome, Italy", AverageDuration: 7 },
    { Place: "Bangkok, Thailand", AverageDuration: 7 },
    { Place: "Athens, Greece", AverageDuration: 9 },
    { Place: "Cairo, Egypt", AverageDuration: 7 },
    { Place: "Vancouver, Canada", AverageDuration: 7 },
    { Place: "Seoul, South Korea", AverageDuration: 9 },
    { Place: "Los Angeles, United States", AverageDuration: 7 },
    { Place: "Cape Town, South Africa", AverageDuration: 9 },
    { Place: "Santorini, Greece", AverageDuration: 7 },
    { Place: "Phnom Penh, Cambodia", AverageDuration: 5 },
    { Place: "Auckland, New Zealand", AverageDuration: 7 },
];

const itineraryIcons = {
    "Sightseeing": "travel_explore",
    "Outdoor Adventure": "hiking",
    "Cultural Experience": "temple_buddhist",
    "Food and Dining": "brunch_dining",
    "Shopping": "shopping_bag",
    "Entertainment": "attractions",
    "Nature Exploration": "forest",
    "Relaxation": "relax",
    "other": "activity_zone"
}


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
        showMeridian: false,
        defaultTime: "12:00"
    });

    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $(".dropdown-menu li").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    function setup(){
        var elem = document.getElementsByClassName("itineraryPlan")
        
        if(elem.length >0){
            var screenHeight = screen.height
            elem[0].setAttribute("style", `height:${screenHeight - 340}px`)
        }

         // Client-side code
    fetch('/itineraryData')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not OK');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);

        if (data && data.itinerary) {
            const itinerary = data.itinerary;

            console.log(itinerary);

            insertItinerary(itinerary);
        } else {
            console.log('Invalid itinerary data');
        }
    })
    .catch(error => {
        console.error(error);
    });
        
    }

    if(groupName != "Join a group First!"){
        setup();
    }

    


    var countrySelect = document.getElementById('country');
    var citySelect = document.getElementById('city');



    // Fetch country data from the API
    fetch('https://countriesnow.space/api/v0.1/countries')
        .then(response => response.json())
        .then(data => {
            console.log(citySelect)

            // Iterate over the country data and create country options
            console.log(countrySelect);
            data.data.forEach(info => {
                var option = document.createElement('li');
                // option.value = info.country;
                option.innerHTML = info.country;
                option.addEventListener('click', function (e) {
                    // Code to be executed when the li element is clicked
                    selectedCountry = e.target.innerHTML;
                    $("#city").empty();
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
                setTimeout(() => {
                    var firstChild = document.getElementById('city').firstElementChild;
                    var inputElement = document.createElement("input"); // Create the <input> element

                    inputElement.setAttribute("class", "form-control"); // Set the class attribute
                    inputElement.setAttribute("id", "myCityInput"); // Set the id attribute
                    inputElement.setAttribute("type", "text"); // Set the type attribute
                    inputElement.setAttribute("placeholder", "Select city"); // Set the placeholder attribute
                    citySelect.insertBefore(inputElement, firstChild);
                    $("#myCityInput").on("keyup", function () {
                        var value = $(this).val().toLowerCase();
                        $(".dropdown-city li").filter(function () {
                            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                        });
                    });


                })
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

function keepNumbersOnly(string) {
    return Number(string.replace(/\D/g, ''));
  }
  


  

async function submitForm() {
    var startDate = document.getElementById("startDateValue").value;
    var endDate = document.getElementById("endDateValue").value;
    var startTime = document.getElementById("startTimeValue").value;
    var endTime = document.getElementById("endTimeValue").value;
    console.log(selectedCities)
    var checkBool = await keepNumbersOnly(startTime) < keepNumbersOnly(endTime);
    checkBoolTwo = await new Date(startDate) < new Date(endDate)
    var postData = {
        'startDate': startDate,
        'endDate': endDate,
        'startTime': startTime,
        'endTime': endTime,
        'country': selectedCountry,
        'cities': JSON.stringify(selectedCities)
    }

    if (startDate != "" && endDate != "" && startTime != "" && endTime != "" && selectedCountry != undefined && selectedCities != []) {
        if (checkBool==true && checkBoolTwo== true) {
            // notify("AI is generating your itinerary! Please note that the response time might take longer if the travel duration is long.");
            $('#makeNewModal').modal("hide");

            swal({
                title: "AI is generating your itinerary!",
                text: "Please note that the response time might take longer if the travel duration is long.",
                icon: "success",
            }).then(() => {
                fetch('/itinerary/submitNew', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(postData)
                })
                    .then(response => response.json())
                    .then(data => {
                        
                        notify(data.message);
                        console.log(data)
                        insertItinerary(data.itinerary);
                        window.location.href = "/home";
    
    
                    })
                    .catch(error => {
                        // Handle any errors
                        console.error(error);
                    });
            })


        } else {
            swal("Start time/ date can not be later than end time/date!")
        }


    } else {
        swal("Please fill in all the fields!")
    }


    console.log(postData)




    // Client-side JavaScript
}

function calculateEndDate(days, startDate) {
    // Convert the start date to a JavaScript Date object
    const startDateObj = new Date(startDate);

    // Calculate the end date by adding the number of days to the start date
    const endDateObj = new Date(startDateObj.getTime() + days * 24 * 60 * 60 * 1000);

    // Get the year, month, and day components of the end date
    const year = endDateObj.getFullYear();
    const month = String(endDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(endDateObj.getDate()).padStart(2, "0");

    // Return the end date as a string in the format "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
}

function insertItinerary(itineraryJSON) {
    if(itineraryJSON.length>0){
        const itineraryContainer = document.querySelector('.itineraryPlan');
    itineraryContainer.innerHTML = '';
    for (let i = 0; i < itineraryJSON.length; i++) {
        const itinerary = itineraryJSON[i];
        const dateButton = document.createElement('button');
        dateButton.type = 'button';
        dateButton.classList.add('dateTrigger');
        dateButton.setAttribute('data-toggle', 'collapse');
        dateButton.setAttribute('data-target', `#demo${i + 1}`);
        dateButton.innerText = itinerary.date;

        const collapseContainer = document.createElement('div');
        collapseContainer.id = `demo${i + 1}`;
        collapseContainer.classList.add('collapse', 'itineraryBlockContainer');

        itinerary.schedule.forEach((schedule) => {
            var schedule = schedule;
            const itineraryBlock = document.createElement('div');
            itineraryBlock.classList.add('itineraryBlock');

            const itineraryTime = document.createElement('div');
            itineraryTime.classList.add('itineraryTime');

            const itineraryTimeText = document.createElement('div');
            itineraryTimeText.classList.add('itineraryTimeText');
            itineraryTimeText.innerHTML = `
          <p>${schedule.startTime}</p>
          <p>|</p>
          <p>${schedule.endTime}</p>
        `;

            const itineraryTimeDecorator = document.createElement('p');
            itineraryTimeDecorator.classList.add('itineraryTimeDecorator');

            const decoratorCircle = document.createElement('span');
            decoratorCircle.classList.add('decoratorCircle');
            decoratorCircle.classList.add('material-symbols-outlined');

            if(itineraryIcons[schedule.category]){
                decoratorCircle.innerHTML = itineraryIcons[schedule.category]
            }else{
                decoratorCircle.innerHTML = itineraryIcons.other
            }
            itineraryTimeDecorator.appendChild(decoratorCircle);
            itineraryTime.appendChild(itineraryTimeText);
            itineraryTime.appendChild(itineraryTimeDecorator);

            const itineraryActivity = document.createElement('div');
            itineraryActivity.classList.add('itineraryActivity');
            itineraryActivity.innerHTML = `
          ${schedule.activity}<br>
          ${schedule.transportation}<span class="material-symbols-outlined itineraryBlockEdit">edit_note</span>
        `;

            itineraryBlock.appendChild(itineraryTime);
            itineraryBlock.appendChild(itineraryActivity);
            collapseContainer.appendChild(itineraryBlock);



            // Select the 'span' element within 'itineraryActivity'
            var editButton = itineraryActivity.querySelector(".itineraryBlockEdit");
            var passobj = {
                'date': itinerary.date,
                'schedule': schedule
            }

            // Attach an event listener to the 'span' element
            editButton.addEventListener("click", function () {
                editItinerary(passobj);
            })
        });

        itineraryContainer.appendChild(dateButton);
        itineraryContainer.appendChild(collapseContainer);
    }

    }
    
}

function editItinerary(passObj) {
    console.log(passObj);
    deleteSchedule = passObj.schedule;
    targetDate = passObj.date;
    referStartTime = passObj.schedule.startTime;
    $("#editModal").modal("show");
    setTimeout(() => {
        document.getElementById("editActivity").setAttribute("value", passObj.schedule.activity);
        // var elem = document.getElementById("startTimeValue")
        // elem.value = passObj.schedule.startTime
        // console.log(elem.value)
        $("#startTimeEdit").val(passObj.schedule.startTime);
        $("#endTimeEdit").val(passObj.schedule.endTime);
        // $("#endTimeValue").val(passObj.schedule.endTime)

        // document.getElementById("startTimeValue").setAttribute("value", passObj.schedule.startTime);
        // document.getElementById("endTimeValue").setAttribute("value", passObj.schedule.endTime);
    }, 100)
}

function parseCityCountry(inputString) {
    // Split the input string by comma and trim whitespace
    const parts = inputString.split(",").map((part) => part.trim());

    // Extract the city and country from the parts array
    const city = parts[0];
    const country = parts[1];

    // Return the city and country as an array
    return [city, country];
}

function getRecommendations() {
    var startDate = $("#startDateValue").val();
    if (startDate) {
        var recommededTrip = recommendedTrips[Math.round(Math.random() * recommendedTrips.length)];
        var endDate = calculateEndDate(recommededTrip.AverageDuration, startDate);
        var recCity = parseCityCountry(recommededTrip.Place)[0];
        var recCountry = parseCityCountry(recommededTrip.Place)[1];
        selectedCountry = recCountry;
        selectedCities = [recCity];
        $("#selectedCountry").html(recCountry);
        $("#endDateValue").val(endDate);
        $("#startTimeValue").val("09:00");
        $("#endTimeValue").val("18:00");
        $("#selectedCities").empty().append(
            `<span class="cityItem" onclick="handleCity(${recCity})">${recCity}</span>`
        );
        fetch("https://countriesnow.space/api/v0.1/countries")
            .then((response) => response.json())
            .then((data) => {
                // Iterate over the city data and create city options
                data.data.forEach((country) => {
                    if (country.country === recCountry) {
                        country.cities.forEach((city) => {
                            var option = document.createElement("li");
                            option.innerHTML = city;
                            option.addEventListener("click", function (e) {
                                // Code to be executed when the li element is clicked
                                console.log(e.target.innerHTML);
                                selectedCities.push(e.target.innerHTML);
                                var html = document.getElementById("selectedCities").innerHTML;
                                html += `<span class="cityItem" onclick="handleCity(${e.target.innerHTML})">${e.target.innerHTML}</span>`;
                                document.getElementById("selectedCities").innerHTML = html;
                            });
                            $("ul#city").append(option);
                        });
                    }
                });
            })
            .catch((error) => {
                console.log("Error:", error);
            });

    } else {
        swal("Please select a start date to get an AI recommended trip!");
    }
}

function convertTime(timeStr) {
    return new Date(timeStr);
}

function submitEdit() {
    var startTime = document.getElementById("startTimeEdit").value
    var endTime = document.getElementById("endTimeEdit").value
    var activity = document.getElementById("editActivity").value
    var securityCheck = keepNumbersOnly(endTime) > keepNumbersOnly(startTime)

    setTimeout(() => {
        if (securityCheck) {

            var postData = {
                'schedule': JSON.stringify({
                    'startTime': startTime,
                    'endTime': endTime,
                    'activity': activity
                }),
                'date': targetDate,
                'referStartTime': referStartTime
            }
            fetch('/itinerary/edit', {
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
                    $("#editModal").modal("hide")
                    notify(data.message);
                    setTimeout(()=>{
                        location.reload()
                    },800)
                    
                })
                .catch(error => {
                    // Handle any errors
                    console.error(error);
                });

        } else {
            swal("end time can not be earlier than start time!")
        }

    })

}

function notify(message){
    var elem = document.getElementById("primaryAlert");
    var messageElem = document.getElementById("alertMessage");
    messageElem.innerText = message;
    elem.setAttribute("style", "display:block;opacity:1;top:60px;");
    setTimeout(()=>{
        elem.setAttribute("style", "display:none;opacity:0;top:75px;");
    }, 8000)
}

function deleteActivity() {
    var postData = {
        'deleteSchedule': JSON.stringify(deleteSchedule),
        'date': targetDate
    }

    $("#confirmModal").modal("hide");
    fetch('/itinerary/delete', {
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
            notify(data.message);
            setTimeout(()=>{
                location.reload()
            },800)
        })
        .catch(error => {
            // Handle any errors
            console.error(error);
        });
}

function submitAdjustDates() {
    var startDate = document.getElementById("startPickerAdjustValue").value
    var endDate = document.getElementById("endPickerAdjustValue").value
    
    if (startDate != "" && endDate != "") {
        if (convertTime(endDate) >= convertTime(startDate)) {
            var postData = {
                'startDate': startDate,
                'endDate': endDate
            }
            notify("AI is generating your request! please note that the respond might take longer if the travel duration is long.");
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
                    $("#adjustDateModal").modal("hide");
                    notify(data.message);
                    console.log("data", data.itinerary);
                    insertItinerary(data.itinerary);

                })
                .catch(error => {
                    // Handle any errors
                    console.error(error);
                });
        } else {
            //alert that starte date can not be latter than end Date
            swal("Please ensure the start date is ealier or equal to the end date!")
        }

    } else {
        swal("Please fill out all fields!")
    }

}