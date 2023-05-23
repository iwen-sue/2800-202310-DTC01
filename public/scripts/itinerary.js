var selectedCountry, selectedCities = [];

$(document).ready(function () {
    $('#startPicker').datepicker({
        format: "yyyy-mm-dd"
    });

    $('#endPicker').datepicker({
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
                                console.log(e.target.innerHTML);
                                selectedCities.push(e.target.innerHTML)
                                var html = document.getElementById("selectedCities").innerHTML;
                                html += `<span class="cityItem" onclick="handleCity(${e.target.innerHTML})">${e.target.innerHTML}</span>`
                                document.getElementById("selectedCities").innerHTML = html;
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




});

function handleCity(city) {

    //delete city element if user click
    //remove that city in array
    console.log(city)
}

function submitForm() {
    var startDate = document.getElementById("startDateValue").value;
    var endDate = document.getElementById("endDateValue").value;
    var startTime = document.getElementById("startTimeValue").value;
    var endTime = document.getElementById("endTimeValue").value;
    console.log(selectedCities)
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
            console.log("data", data.itinerary)
            insertItinerary(data.itinerary);


        })
        .catch(error => {
            // Handle any errors
            console.error(error);
        });

        // Client-side JavaScript
}

function insertItinerary(itineraryJSON) {
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
      });
  
      itineraryContainer.appendChild(dateButton);
      itineraryContainer.appendChild(collapseContainer);
    }
  }
  

function getRecommendations(){
    var startDate = document.getElementById("startDateValue").value
    if(startDate){
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

    }else{
        alert("please select a startDate to get advices from AI!")
    }
    
}