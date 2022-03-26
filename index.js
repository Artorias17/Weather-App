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
        .then((data) => data)

    locationArray.forEach((value) => {
        value = value["woeid"];
    })
    return locationArray;
}


async function getWeatherData(id) {
    let weatherInfo = await fetch(proxy + weatherAPI + `location/${id}/`)
        .then((response) => response.json())
        .then((data) => {
            return {city: data["title"], weather: data["consolidated_weather"][0]}
        })

    weatherInfo.weather.forEach((value) => {
        delete value["id"]
        delete value["wind_direction"]
        delete value["created"]
    })

    return weatherInfo;
}

function fillData(city, weatherObjectsArray) {
    const cards = document.querySelectorAll(".card");

    cards[0].content.querySelector(".location").innerHTML = city;

    weatherObjectsArray.forEach((value, index) => {
        let cardEdit = cards[index].content.querySelector;

        cardEdit(".day").innerHTML = day[new Date(value["applicable_date"]).getDay()];
        cardEdit(".main-temp").innerHTML = `${value["the_temp"]}°C`;
        cardEdit(".weather-state-name").innerHTML = value["weather_state_name"];
        cardEdit(".min_temp").innerHTML = `${value["min_temp"]}°C`;
        cardEdit(".max-temp").innerHTML = `${value["min_temp"]}°C`;
        cardEdit(".weather-state-icon").src = `img/icons/${value["weather_state_abbr"]}.svg`
        cardEdit(".weather-state-icon").alt = value["weather_state_name"];
        cardEdit(".wind_speed").innerHTML = `${value["wind_speed"] * 1.609} km/h`;
        cardEdit(".wind-icon").src = `img/icons/${value["wind_direction_compass"]}.svg`
        cardEdit(".wind-icon").alt = value["wind_direction_compass"];
        cardEdit(".air-pressure").innerHTML = `${value["air_pressure"] / 1013} atm`;
        cardEdit(".humidity-percentage").innerHTML = `${value["humidity"]}%`;
        cardEdit(".visibility-distance").innerHTML = `${value["visibility"] * 1.609} km`;
        cardEdit(".predictability-percentage").innerHTML = `${value["predictability"]}%`;
    })
}

search.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const locations = getLocationIDs(search.querySelector("input").value);
    const data = getWeatherData(locations[0]);
    fillData(data.city, data.weather);
})

search.onsubmit