// const grid = document.querySelector(".main-container");
//
// const { unwrapGrid, forceGridAnimation } = animateCSSGrid.wrapGrid(grid, {duration: 1000});
//
// const search = document.querySelector(".search-box-container");
//
// const searchButton = document.querySelector(".search-box-container button");
//
// searchButton.addEventListener("click", (event)=>{
//     if(search.hasAttribute("data-initial")){
//         search.children[0].width = "50%";
//     }else{
//         search.children[0].width = "100%";
//     }
//     search.toggleAttribute("data-initial");
//     forceGridAnimation();
//
// });
const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weatherIcons = {sn: "snow", sl: "sleet",  h: "hail", t: "thunderstorm", hr: "heavy_rain", lr: "rain", s: "showers", hc: "cloud", lc:"light_cloud", c: "sunny"}

const search = document.querySelector(".search-box");


const proxy = "https://cors-anywhere.herokuapp.com/"
const weatherAPI = "https://www.metaweather.com/api/";


async function getLocationIDs(location) {
    let locationArray = await fetch(`${proxy}${weatherAPI}location/search/?query=${location}`)
        .then((response) => response.json())
        .then((data) => {
            console.log("Successfully retrieved location results")
            return data
        })

    locationArray.forEach((value, index) => {
        locationArray[index] = value["woeid"];
    })
    console.log(locationArray)
    return locationArray;
}

function to2Decimal(number){
    return Math.round(number * 10) / 10;
}
async function getWeatherData(id) {
    let weatherInfo = await fetch(proxy + weatherAPI + `location/${id}/`)
        .then((response) => response.json())
        .then((data) => {
            console.log("Successfully retrieved data for " + data.title);
            return {city: data["title"], weather: data["consolidated_weather"]}
        })

    weatherInfo.weather.forEach((value) => {
        delete value.id;
        delete value.wind_direction;
        delete value.created;
        value.applicable_date = day[new Date(value.applicable_date).getDay()];
        value.the_temp = to2Decimal(value.the_temp);
        value.min_temp = to2Decimal(value.min_temp);
        value.max_temp = to2Decimal(value.max_temp);
        value.wind_speed = to2Decimal(value.wind_speed * 1.609) ;
        value.air_pressure = to2Decimal(value.air_pressure / 1013)
        value.visibility = to2Decimal(value.visibility * 1.609);

        if(value.wind_direction_compass.length === 3)
            value.wind_direction_compass = value.wind_direction_compass.substring(1);
    })

    console.log(weatherInfo);
    return weatherInfo;
}

function fillData(city, weatherObjectsArray) {
    const cards = document.querySelectorAll(".card");

    cards[0].querySelector(".location").innerHTML = city;

    weatherObjectsArray.forEach((value, index) => {
        cards[index].querySelector(".day").innerHTML = value["applicable_date"];
        cards[index].querySelector(".main-temp").innerHTML = `${value["the_temp"]}°C`;
        cards[index].querySelector(".weather-state-name").innerHTML = value["weather_state_name"];
        cards[index].querySelector(".min_temp").innerHTML = `${value["min_temp"]}°C`;
        cards[index].querySelector(".max_temp").innerHTML = `${value["max_temp"]}°C`;
        cards[index].querySelector(".weather-state-icon").src = `img/icons/${weatherIcons[value["weather_state_abbr"]]}.svg`
        cards[index].querySelector(".weather-state-icon").alt = value["weather_state_name"];
        cards[index].querySelector(".wind_speed").innerHTML = `${value["wind_speed"]} km/h`;
        cards[index].querySelector(".wind-icon").src = `img/icons/${value["wind_direction_compass"]}.svg`
        cards[index].querySelector(".wind-icon").alt = value["wind_direction_compass"];
        cards[index].querySelector(".air-pressure").innerHTML = `${value["air_pressure"]} atm`;
        cards[index].querySelector(".humidity-percentage").innerHTML = `${value["humidity"]}%`;
        cards[index].querySelector(".visibility-distance").innerHTML = `${value["visibility"]} km`;
        cards[index].querySelector(".predictability-percentage").innerHTML = `${value["predictability"]}%`;
    })

    console.log("Successfully Updated");
}

search.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const searchString = search.querySelector("input").value;
    console.log(searchString);
    const locations = await getLocationIDs(searchString);
    const data = await getWeatherData(locations[0]);
    await fillData(data.city, data.weather);
})
