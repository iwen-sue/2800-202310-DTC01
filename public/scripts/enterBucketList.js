
async function getSuggestion(promptArgs, apiKey) {
    const option = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [{ "role": "user", "content": promptArgs }]
        })
    };

    try {
        response = await fetch('https://api.openai.com/v1/chat/completions', option)
        data = await response.json();
        console.log(data);
        document.getElementById('description').innerHTML = data.choices[0].message.content + `\n\n and more...`;

    } catch (error) {
        console.log(error);
    }
};


const setup = () => {
    console.log("setup edit bucket list");

    let eventCount = 0;
    var countrySelect = document.getElementById('country');
    var citySelect = document.getElementById('city');
    $('#city').hide();

    // Fetch country data from the API
    fetch('https://countriesnow.space/api/v0.1/countries')
        .then(response => response.json())
        .then(data => {
            // Iterate over the country data and create country options
            console.log(countrySelect);
            data.data.forEach(info => {
                var option = document.createElement('option');
                option.value = info.country;
                option.text = info.country;
                countrySelect.appendChild(option);
            });
            $('.country-select').selectpicker();
        })
        .catch(error => {
            console.log('Error:', error);
        });


    // Handle country selection change event
    countrySelect.addEventListener('change', function () {
        eventCount++;
        console.log(eventCount, countrySelect.value);
        $('#description').empty();
        $('#city').show();
        var selectedCountry = countrySelect.value;

        // Clear previous city options
        citySelect.innerHTML = '<option selected>Select your destination city</option>';


        // Fetch city data for the selected country from the API
        fetch('https://countriesnow.space/api/v0.1/countries')
            .then(response => response.json())
            .then(data => {
                // Iterate over the city data and create city options
                data.data.forEach(country => {
                    if (country.country === selectedCountry) {
                        country.cities.forEach(city => {
                            var option = document.createElement('option');
                            option.value = city;
                            option.text = city;
                            citySelect.appendChild(option);
                        });

                    }
                });
                $('.city-select').selectpicker('refresh');
            }).then(() => {
                document.querySelectorAll(' .filter-option-inner-inner')[1].innerHTML = "Select your destination city";
            })
            .catch(error => {
                console.log('Error:', error);
            });

        citySelect.addEventListener('change', async function () {
            eventCount++;
            $('#description').empty();
            // console.log(eventCount, citySelect.value);
            var selectedCity = citySelect.value;
            if (selectedCountry == countrySelect.value && selectedCity == citySelect.value) {
                console.log(selectedCountry);
                console.log(selectedCity);
                var promptArgs = `what can I do in ${selectedCity}, ${selectedCountry}. list 5 short sentences with few words`;
                console.log(promptArgs);

                fetch('/api-key')
                    .then(response => response.json())
                    .then(data => {
                        const apiKey = data.apiKey;
                        // Use the API key in your client-side code
                        // console.log(apiKey);
                        getSuggestion(promptArgs, apiKey);
                    })
                    .catch(error => {
                        console.error('Error retrieving API key:', error);
                    });
                
                eventCount = 0;
            };

        });

    });

    $('.submitBtn').on('click', function () {
        if ($('#country').val() == "" || $('#city').val() == "Select your destination city") {
            console.log('input error')
            alert("Please select your destination country and city");
            return false;
        };
    });


}


$(document).ready(setup);