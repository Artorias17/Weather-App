const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weatherIcons = {sn: "snow", sl: "sleet",  h: "hail", t: "thunderstorm", hr: "heavy_rain", lr: "rain", s: "showers", hc: "cloud", lc:"light_cloud", c: "sunny"}
const weatherBackground = {sn: "snow", sl: "snow",  h: "snow", t: "thunderstorm", hr: "heavy_rain", lr: "rain", s: "rain", hc: "heavy_cloud", lc:"light_cloud", c: "sunny"}

const search = document.querySelector(".search-box");
const cardContainer = document.querySelectorAll(".card-container");
const cardTemplate = document.querySelector("template").content;

const customElement = document.createElement("lord-icon");
customElement.setAttribute("src", "https://cdn.lordicon.com/ymrqtsej.json");
customElement.setAttribute("trigger", "loop");
customElement.setAttribute("colors", "primary:#848484");
customElement.setAttribute("style", "width:10vw; height: auto; margin: auto;");

const weatherAPI = "api/";


search.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setSpinnerAll();

    const searchString = search.querySelector("input").value;
    const locations = await getLocationID(searchString);
    const data = await getWeatherData(locations[0]);
    await setChange(data.city, data.weather);
})


function setSpinnerAll() {
    cardContainer.forEach((value, index) => {
        while (cardContainer[index].firstChild) cardContainer[index].removeChild(cardContainer[index].firstChild);
        cardContainer[index].appendChild(customElement.cloneNode());
    });
}


function to1DecimalPlace(number){
    return Math.round(number * 10) / 10;
}


function getRandom(start, end){
    return Math.random() * (end - start) + start;
}


async function getLocationID(location, queryType = `query`) {
    let locationArray = await fetch(`${weatherAPI}location/search/?${queryType}=${location}`)
        .then((response) => response.json())
        .then((data) => {
            return data
        })

    locationArray.forEach((value, index) => {
        locationArray[index] = value["woeid"];
    });
    return locationArray;
}


async function getWeatherData(id) {
    let weatherInfo = await fetch( `${weatherAPI}location/${id}/`)
        .then((response) => response.json())
        .then((data) => {
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

    return weatherInfo;
}


function setChange(city, weatherObjectsArray) {
    weatherObjectsArray.forEach((value, index) => {
        const card = cardTemplate.cloneNode(true);
        card.querySelector(".day").textContent = value["applicable_date"];
        card.querySelector(".main-temp").textContent = `${value["the_temp"]}°C`;
        card.querySelector(".weather-state-name").textContent = value["weather_state_name"];
        card.querySelector(".min_temp").textContent = `${value["min_temp"]}°C`;
        card.querySelector(".max_temp").textContent = `${value["max_temp"]}°C`;
        card.querySelector(".weather-state-icon").src = `img/icons/${weatherIcons[value["weather_state_abbr"]]}.svg`
        card.querySelector(".weather-state-icon").alt = value["weather_state_name"];
        card.querySelector(".wind_speed").textContent = `${value["wind_speed"]}km/h`;
        card.querySelector(".wind-icon").src = `img/icons/${value["wind_direction_compass"]}.svg`
        card.querySelector(".wind-icon").alt = value["wind_direction_compass"];
        card.querySelector(".air-pressure").textContent = `${value["air_pressure"]}atm`;
        card.querySelector(".humidity-percentage").textContent = `${value["humidity"]}%`;
        card.querySelector(".visibility-distance").textContent = `${value["visibility"]}km`;
        card.querySelector(".predictability-percentage").textContent = `${value["predictability"]}%`;

        if(index === 0) {
            const loc = document.createElement("h1");
            loc.classList.add("location");
            loc.innerHTML = city;
            card.querySelector(".card").appendChild(loc);
            card.querySelector(".card").classList.add("main-card");

            document.querySelector("body").style.backgroundImage = `url("img/background/${weatherBackground[value["weather_state_abbr"]]}.jpg")`
        }

        while (cardContainer[index].firstChild) cardContainer[index].removeChild(cardContainer[index].firstChild);
        cardContainer[index].appendChild(card);
    });

}

function begin(){
    navigator.geolocation.getCurrentPosition(
        async (geo) => {
            const locations = await getLocationID(`${geo.coords.latitude},${geo.coords.longitude}`, "lattlong");
            const data = await getWeatherData(locations[0]);
            await setChange(data.city, data.weather);
        },
        async () => {
            const locations = await getLocationID(`${getRandom(-90, 91)},${getRandom(-180, 181)}`, "lattlong");
            const data = await getWeatherData(locations[0]);
            await setChange(data.city, data.weather);
        });
}

begin();