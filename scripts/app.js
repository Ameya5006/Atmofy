// 🌤️ Atmofy Weather App
const API_KEY = "bda3399a0ddbc5b48fb6b5b4fc1b286b";

const input = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locBtn = document.getElementById("loc-btn");
const card = document.getElementById("weather-card");
const errorMsg = document.getElementById("error");
const background = document.getElementById("background");
const loader = document.getElementById("loader");

// ---------- SHOW / HIDE LOADER ----------
function showLoader() {
  loader.classList.remove("hidden");
}
function hideLoader() {
  loader.classList.add("hidden");
}

// ---------- EVENT HANDLERS ----------
searchBtn.addEventListener("click", () => {
  const city = input.value.trim();
  if (city) getWeatherByCity(city);
  else errorMsg.textContent = "Please enter a city name.";
});
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});
locBtn.addEventListener("click", getWeatherByLocation);

// ---------- FETCH WEATHER ----------
async function getWeatherByCity(city) {
  try {
    showLoader();
    errorMsg.textContent = "";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    hideLoader();
    if (data.cod === "404") throw new Error("City not found");
    displayWeather(data);
  } catch (err) {
    hideLoader();
    card.classList.add("hidden");
    errorMsg.textContent = err.message;
  }
}

// ---------- DISPLAY WEATHER ----------
function displayWeather(data) {
  const { name } = data;
  const { icon, description, main } = data.weather[0];
  const { temp, humidity } = data.main;
  const { speed } = data.wind;

  document.getElementById("city-name").textContent = name;
  document.getElementById("weather-icon").src =
    `https://openweathermap.org/img/wn/${icon}@2x.png`;
  document.getElementById("description").textContent = description;
  document.getElementById("temp").textContent = `🌡️ ${temp.toFixed(1)}°C`;
  document.getElementById("humidity").textContent = `💧 Humidity: ${humidity}%`;
  document.getElementById("wind").textContent = `💨 Wind: ${speed} m/s`;

  // DYNAMIC TEMPERATURE COLOR
  const tempEl = document.getElementById("temp");
  if (temp <= 10) tempEl.style.color = "#00bcd4";
  else if (temp <= 25) tempEl.style.color = "#8bc34a";
  else if (temp <= 35) tempEl.style.color = "#ffc107";
  else tempEl.style.color = "#f44336";

  // DYNAMIC CARD GLOW
  if (temp <= 10) card.style.boxShadow = "0 0 20px rgba(0,188,212,0.6)";
  else if (temp <= 25) card.style.boxShadow = "0 0 20px rgba(139,195,74,0.6)";
  else if (temp <= 35) card.style.boxShadow = "0 0 20px rgba(255,193,7,0.6)";
  else card.style.boxShadow = "0 0 20px rgba(244,67,54,0.6)";

  // BACKGROUND CHANGE BASED ON WEATHER
  background.className = "background";
  const condition = main.toLowerCase();
  if (condition.includes("rain")) background.classList.add("rainy-bg");
  else if (condition.includes("cloud")) background.classList.add("cloudy-bg");
  else if (condition.includes("clear")) background.classList.add("clear-bg");
  else if (condition.includes("snow")) background.classList.add("snow-bg");
  else background.classList.add("sunny-bg");

  card.classList.remove("hidden");
}

// ---------- GEOLOCATION ----------
function getWeatherByLocation() {
  if (!navigator.geolocation) {
    errorMsg.textContent = "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        showLoader();
        const { latitude, longitude } = pos.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        hideLoader();
        displayWeather(data);
      } catch {
        hideLoader();
        errorMsg.textContent = "Could not fetch weather.";
      }
    },
    () => (errorMsg.textContent = "Location access denied.")
  );
}
