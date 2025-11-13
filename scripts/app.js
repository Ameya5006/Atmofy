// Basic Atmofy Weather App
const API_KEY = "bda3399a0ddbc5b48fb6b5b4fc1b286b"; // your key

const input = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locBtn = document.getElementById("loc-btn");
const card = document.getElementById("weather-card");
const errorMsg = document.getElementById("error");

// ------------ SEARCH BUTTON ------------
searchBtn.addEventListener("click", function() {
  const city = input.value.trim();

  if (city !== "") {
    getWeatherByCity(city);
  } else {
    errorMsg.textContent = "Please enter a city name.";
  }
});

// ------------ ENTER KEY PRESS ------------
input.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// ------------ FETCH WEATHER BY CITY ------------
function getWeatherByCity(city) {
  errorMsg.textContent = "";

  const url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=metric&appid=" +
    API_KEY;

  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.cod == 404) {
        errorMsg.textContent = "City not found.";
        card.classList.add("hidden");
      } else {
        displayWeather(data);
      }
    });
}

// ------------ DISPLAY WEATHER DATA ------------
function displayWeather(data) {
  const cityName = data.name;
  const icon = data.weather[0].icon;
  const description = data.weather[0].description;
  const temperature = data.main.temp;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;

  document.getElementById("city-name").textContent = cityName;
  document.getElementById("weather-icon").src =
    "https://openweathermap.org/img/wn/" + icon + "@2x.png";
  document.getElementById("description").textContent = description;
  document.getElementById("temp").textContent =
    "Temperature: " + temperature + "°C";
  document.getElementById("humidity").textContent =
    "Humidity: " + humidity + "%";
  document.getElementById("wind").textContent =
    "Wind Speed: " + windSpeed + " m/s";

  card.classList.remove("hidden");
}

// ------------ GET WEATHER BY LOCATION ------------
locBtn.addEventListener("click", function() {
  if (!navigator.geolocation) {
    errorMsg.textContent = "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const url =
        "https://api.openweathermap.org/data/2.5/weather?lat=" +
        lat +
        "&lon=" +
        lon +
        "&units=metric&appid=" +
        API_KEY;

      fetch(url)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          displayWeather(data);
        });
    },
    function() {
      errorMsg.textContent = "Location access denied.";
    }
  );
});
