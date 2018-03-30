function attachEvents() {
    const url = 'https://judgetests.firebaseio.com/';
    const forecastSection = $('#forecast');
    const currentDiv = $('#current');
    const upcomingDiv = $('#upcoming');
    const errorDiv = $('<div class="error">ERROR</div>');
    const weatherSymbols = {
        'Sunny': '&#x2600', // ☀
        'Partly sunny': '&#x26C5', // ⛅
        'Overcast': '&#x2601', // ☁
        'Rain': '&#x2614', // ☂
        'Degrees': '&#176' // °
    }

    const location = $('#location');
    $('#submit').click(getWeather);

    function getWeather() {

        $.ajax({
            method: 'GET',
            url: url + `locations.json`,
            success: function (response) {

                $('span').remove();

                let locationCode = response.filter(e => e['name'] === location.val())[0];
                if (locationCode !== undefined) {

                    locationCode = locationCode.code;

                    //CURRENT CONDITIONS
                    $.ajax({
                        method: 'GET',
                        url: url + `/forecast/today/${locationCode}.json `,
                        success: function (response) {


                            forecastSection.css('display', 'block');

                            let symbolSpan = $(`<span class="condition symbol">${weatherSymbols[response.forecast.condition]}</span>`);

                            let containerSpan = $('<span class="condition">')
                                .append($(`<span class="forecast-data">${response.name}</span>`))
                                .append($(`<span class="forecast-data">${response.forecast.high}${weatherSymbols['Degrees']}/${response.forecast.low}${weatherSymbols['Degrees']}</span>`))
                                .append($(`<span class="forecast-data">${response.forecast.condition}</span>`));

                            currentDiv.append(symbolSpan);
                            currentDiv.append(containerSpan);
                        },
                        error: errorHandler
                    });

                    //UPCOMMING CONDITIONS 
                    $.ajax({
                        method: 'GET',
                        url: url + `/forecast/upcoming/${locationCode}.json `,
                        success: function (response) {

                            generateSpan(0);
                            generateSpan(1);
                            generateSpan(2);

                            function generateSpan(index) {
                                let upcomingSpan = $('<span class = "upcoming">')
                                    .append($(`<span class = "symbol">${weatherSymbols[response.forecast[index].condition]}</span>`))
                                    .append($(`<span class = "forecast-data">${response.forecast[index].low}${weatherSymbols['Degrees']}/${response.forecast[index].high}${weatherSymbols['Degrees']}</span>`))
                                    .append($(`<span class = "forecast-data">${response.forecast[index].condition}</span>`))
                                    .appendTo(upcomingDiv);
                            }

                        },
                        error: errorHandler

                    })

                } else {
                    errorHandler();
                }

            },
            error: errorHandler
        })
    }

    function errorHandler(error) {
        forecastSection.css('display', 'block');
        currentDiv.append($('<span class="error">ERROR</span>'));
    }

}