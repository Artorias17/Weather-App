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
const weatherBackground = {sn: "snow", sl: "snow",  h: "snow", t: "thunderstorm", hr: "heavy_rain", lr: "rain", s: "rain", hc: "heavy_cloud", lc:"light_cloud", c: "sunny"}

const search = document.querySelector(".search-box");
const cardContainer = document.querySelectorAll(".card-container");
const cardTemplate = document.querySelector("template");

const customElement = document.createElement("lord-icon");
customElement.setAttribute("src", "https://cdn.lordicon.com/ymrqtsej.json");
customElement.setAttribute("trigger", "loop");
customElement.setAttribute("colors", "primary:#848484");

const weatherAPI = "api/";

function setSpinnerAll() {
    cardContainer.forEach((value, index) => {
        while (cardContainer[index].firstChild) cardContainer[index].removeChild(cardContainer[index].firstChild);
        cardContainer[index].appendChild(customElement);
    });
}

async function getLocationIDs(location) {
    let locationArray = await fetch(`${weatherAPI}location/search/?query=${location}`)
        .then((response) => response.json())
        .then((data) => {
            console.log("Successfully retrieved location results");
            setSpinnerAll();
            return data
        })

    locationArray.forEach((value, index) => {
        locationArray[index] = value["woeid"];
    })
    console.log(locationArray)
    return locationArray;
}

function to1DecimalPlace(number){
    return Math.round(number * 10) / 10;
}

async function getWeatherData(id) {
    let weatherInfo = await fetch( `${weatherAPI}location/${id}/`)
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
        value.the_temp = to1DecimalPlace(value.the_temp);
        value.min_temp = to1DecimalPlace(value.min_temp);
        value.max_temp = to1DecimalPlace(value.max_temp);
        value.wind_speed = to1DecimalPlace(value.wind_speed * 1.609) ;
        value.air_pressure = to1DecimalPlace(value.air_pressure / 1013)
        value.visibility = to1DecimalPlace(value.visibility * 1.609);

        if(value.wind_direction_compass.length === 3)
            value.wind_direction_compass = value.wind_direction_compass.substring(1);
    })

    console.log(weatherInfo);
    return weatherInfo;
}

function setChange(city, weatherObjectsArray) {
    weatherObjectsArray.forEach((value, index) => {
        const card = cardTemplate.cloneNode(true);

        card.querySelector(".day").innerHTML = value["applicable_date"];
        card.querySelector(".main-temp").innerHTML = `${value["the_temp"]}°C`;
        card.querySelector(".weather-state-name").innerHTML = value["weather_state_name"];
        card.querySelector(".min_temp").innerHTML = `${value["min_temp"]}°C`;
        card.querySelector(".max_temp").innerHTML = `${value["max_temp"]}°C`;
        card.querySelector(".weather-state-icon").src = `img/icons/${weatherIcons[value["weather_state_abbr"]]}.svg`
        card.querySelector(".weather-state-icon").alt = value["weather_state_name"];
        card.querySelector(".wind_speed").innerHTML = `${value["wind_speed"]} km/h`;
        card.querySelector(".wind-icon").src = `img/icons/${value["wind_direction_compass"]}.svg`
        card.querySelector(".wind-icon").alt = value["wind_direction_compass"];
        card.querySelector(".air-pressure").innerHTML = `${value["air_pressure"]} atm`;
        card.querySelector(".humidity-percentage").innerHTML = `${value["humidity"]}%`;
        card.querySelector(".visibility-distance").innerHTML = `${value["visibility"]} km`;
        card.querySelector(".predictability-percentage").innerHTML = `${value["predictability"]}%`;

        if(index === 0) {
            const loc = document.createElement("h1");
            loc.classList.add("location");
            loc.innerHTML = city;
            card.appendChild(loc);
        }

        while (cardContainer[index].firstChild) cardContainer[index].removeChild(cardContainer[index].firstChild);
        cardContainer[index].appendChild(card);

        document.querySelector("body").style.backgroundImage = `url("img/background/${weatherBackground[value["weather_state_abbr"]]}.jpg")`

    });

    console.log("Successfully Updated");
}

search.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const searchString = search.querySelector("input").value;
    console.log(searchString);
    const locations = await getLocationIDs(searchString);
    const data = await getWeatherData(locations[0]);
    await setChange(data.city, data.weather);
})
