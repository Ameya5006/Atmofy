// Replace this with your real OpenWeatherMap key
const API_KEY = "bda3399a0ddbc5b48fb6b5b4fc1b286b";

const input = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locBtn = document.getElementById("loc-btn");
const card = document.getElementById("weather-card");
const errorMsg = document.getElementById("error");

// Trigger search on button click
searchBtn.addEventListener("click", () => {
  const city = input.value.trim();
  if (city) getWeatherByCity(city);
  else errorMsg.textContent = "Please enter a city name.";
});

// Trigger search on Enter key
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// Fetch by City
async function getWeatherByCity(city) {
  try {
    errorMsg.textContent = "";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod === "404") throw new Error("City not found");
    displayWeather(data);
  } catch (err) {
    card.classList.add("hidden");
    errorMsg.textContent = err.message;
  }
}

// Display data on screen
function displayWeather(data) {
  const { name } = data;
  const { icon, description } = data.weather[0];
  const { temp, humidity } = data.main;
  const { speed } = data.wind;

  document.getElementById("city-name").textContent = name;
  document.getElementById("weather-icon").src =
    `https://openweathermap.org/img/wn/${icon}@2x.png`;
  document.getElementById("description").textContent = description;
  document.getElementById("temp").textContent = `🌡️ ${temp.toFixed(1)}°C`;
  document.getElementById("humidity").textContent = `💧 Humidity: ${humidity}%`;
  document.getElementById("wind").textContent = `💨 Wind: ${speed} m/s`;

  card.classList.remove("hidden");
}

// Fetch by User Location (Geolocation API)
locBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    errorMsg.textContent = "Geolocation not supported in this browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        displayWeather(data);
      } catch (err) {
        errorMsg.textContent = "Could not fetch weather.";
      }
    },
    () => (errorMsg.textContent = "Location access denied.")
  );
});
