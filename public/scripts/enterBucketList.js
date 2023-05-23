const setup = () => {
    console.log("setup edit bucket list");
    
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
    });

    
}


$(document).ready(setup);