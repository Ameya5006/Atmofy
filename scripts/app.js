// -------------------------
// CONFIGURATION
// -------------------------
const OPENWEATHER_API_KEY = "bda3399a0ddbc5b48fb6b5b4fc1b286b";
const NEWSAPI_KEY = "pub_680590994fce4457af8a52f3a262bd44";

// Base URLs
const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5";
const NEWS_BASE = "https://newsapi.org/v2";

// LocalStorage key for history
const HISTORY_KEY = "atmofy_search_history";

// -------------------------
// DOM REFERENCES
// -------------------------
const navTabs = document.querySelectorAll(".nav-tab");
const contentSections = document.querySelectorAll(".content-section");

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locBtn = document.getElementById("current-location-btn");
const searchError = document.getElementById("search-error");

const moreBtn = document.getElementById("more-btn");
const moreDropdown = document.getElementById("more-dropdown");

// Today elements
const locationNameEl = document.getElementById("location-name");
const currentDateEl = document.getElementById("current-date");
const localTimeEl = document.getElementById("local-time");
const todaySummaryText = document.getElementById("today-summary-text");
const todayHighEl = document.getElementById("today-high");
const todayLowEl = document.getElementById("today-low");
const todayDayDescEl = document.getElementById("today-day-desc");
const todayNightDescEl = document.getElementById("today-night-desc");

const currentIconEl = document.getElementById("current-icon");
const currentTempEl = document.getElementById("current-temp");
const currentDescEl = document.getElementById("current-description");
const currentFeelEl = document.getElementById("current-realfeel");
const currentCloudsEl = document.getElementById("current-clouds");
const currentWindEl = document.getElementById("current-wind");
const currentHumidityEl = document.getElementById("current-humidity");
const currentAqiEl = document.getElementById("current-aqi");

const todayHourlyPreview = document.getElementById("today-hourly-preview");

// Other sections
const hourlyContainer = document.getElementById("hourly-container");
const dailyContainer = document.getElementById("daily-container");
const airQualityDetails = document.getElementById("airquality-details");
const healthContent = document.getElementById("health-content");
const historyListEl = document.getElementById("history-list");

// Feedback
const feedbackForm = document.getElementById("feedback-form");
const feedbackSuccessEl = document.getElementById("feedback-success");

// News
const newsContainer = document.getElementById("news-container");

// -------------------------
// UTILITIES
// -------------------------

function formatDate(dt) {
    const options = { weekday: "long", month: "short", day: "numeric" };
    return dt.toLocaleDateString(undefined, options);
}

function formatTime(dt) {
    const options = { hour: "2-digit", minute: "2-digit" };
    return dt.toLocaleTimeString(undefined, options);
}

function getDayName(dtTxt) {
    const dt = new Date(dtTxt);
    return dt.toLocaleDateString(undefined, { weekday: "short" });
}

// Map AQI number to text
function getAQIDescription(aqi) {
    switch (aqi) {
        case 1: return "Good";
        case 2: return "Fair";
        case 3: return "Moderate";
        case 4: return "Poor";
        case 5: return "Very Poor";
        default: return "Unknown";
    }
}

// -------------------------
// NAVIGATION HANDLING
// -------------------------

// Show a single section and hide others
function showSection(sectionId) {
    contentSections.forEach(sec => {
        if (sec.id === sectionId) {
            sec.classList.add("active");
        } else {
            sec.classList.remove("active");
        }
    });

    // Highlight corresponding nav tab when a main tab is used
    navTabs.forEach(tab => {
        if (tab.dataset.section === sectionId) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
}

// Attach click listeners to nav tabs
navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const sectionId = tab.dataset.section;
        showSection(sectionId);
    });
});

// More dropdown behaviour
moreBtn.addEventListener("click", () => {
    moreDropdown.classList.toggle("hidden");
});

// Clicking an item inside More switches to that section
moreDropdown.addEventListener("click", (event) => {
    const li = event.target.closest("li");
    if (!li) return;
    const sectionId = li.dataset.section;
    showSection(sectionId);
    moreDropdown.classList.add("hidden");
});

// Close dropdown if clicked outside
document.addEventListener("click", (event) => {
    if (!moreDropdown.contains(event.target) && !moreBtn.contains(event.target)) {
        moreDropdown.classList.add("hidden");
    }
});

// -------------------------
// SEARCH + GEOLOCATION
// -------------------------

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) {
        searchError.textContent = "Please enter a city name.";
        return;
    }
    searchError.textContent = "";
    fetchWeatherForCity(city);
});

cityInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

// Use browser geolocation (if allowed)
locBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        searchError.textContent = "Geolocation is not supported by this browser.";
        return;
    }
    searchError.textContent = "Locating...";
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            searchError.textContent = "";
            fetchWeatherByCoordinates(latitude, longitude);
        },
        () => {
            searchError.textContent = "Unable to get your location.";
        }
    );
});

// -------------------------
// FETCH WEATHER DATA
// -------------------------

async function fetchWeatherForCity(city) {
    try {
        // 1. Get current weather to get coordinates
        const url = `${OPENWEATHER_BASE}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("City not found");
        }
        const currentData = await res.json();

        const { lat, lon } = currentData.coord;

        // 2. Fetch forecast and air pollution in parallel
        const [forecastRes, airRes] = await Promise.all([
            fetch(`${OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`),
            fetch(`${OPENWEATHER_BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`)
        ]);

        const forecastData = await forecastRes.json();
        const airData = await airRes.json();

        // Render UI
        renderAllWeather(currentData, forecastData, airData);

        // Save to history
        saveSearchHistory(currentData.name);

        // Switch to Today tab
        showSection("today-section");
    } catch (err) {
        console.error(err);
        searchError.textContent = "Unable to fetch weather. Check the city name or your API key.";
    }
}

async function fetchWeatherByCoordinates(lat, lon) {
    try {
        // 1. Reverse lookup for city name using weather endpoint
        const url = `${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch current weather");
        const currentData = await res.json();

        // 2. Forecast + air quality
        const [forecastRes, airRes] = await Promise.all([
            fetch(`${OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`),
            fetch(`${OPENWEATHER_BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`)
        ]);
        const forecastData = await forecastRes.json();
        const airData = await airRes.json();

        renderAllWeather(currentData, forecastData, airData);
        saveSearchHistory(currentData.name);
        showSection("today-section");
    } catch (err) {
        console.error(err);
        searchError.textContent = "Unable to fetch weather for your location.";
    }
}

// -------------------------
// RENDER FUNCTIONS
// -------------------------

function renderAllWeather(currentData, forecastData, airData) {
    renderToday(currentData, forecastData, airData);
    renderHourly(forecastData);
    renderDaily(forecastData);
    renderAirQuality(airData);
    renderHealthSuggestions(currentData, airData);
}

function renderToday(current, forecast, air) {
    const now = new Date();
    locationNameEl.textContent = `${current.name}, ${current.sys.country}`;
    currentDateEl.textContent = formatDate(now);
    localTimeEl.textContent = `Local time: ${formatTime(now)}`;

    const temp = Math.round(current.main.temp);
    const feels = Math.round(current.main.feels_like);
    const desc = current.weather[0].description;
    const icon = current.weather[0].icon;
    const clouds = current.clouds.all;
    const wind = current.wind.speed;
    const humidity = current.main.humidity;

    currentTempEl.textContent = `${temp}°`;
    currentDescEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
    currentFeelEl.textContent = `RealFeel: ${feels}°`;
    currentCloudsEl.textContent = `${clouds}%`;
    currentWindEl.textContent = `${wind} m/s`;
    currentHumidityEl.textContent = `${humidity}%`;
    currentIconEl.src = `https://openweathermap.org/img/wn/${icon}@4x.png`;
    currentIconEl.alt = desc;

    // Air quality short label
    const aqi = air.list && air.list.length ? air.list[0].main.aqi : null;
    currentAqiEl.textContent = aqi ? getAQIDescription(aqi) : "–";

    // Today's high/low from forecast (same date)
    const todayDateStr = now.toISOString().slice(0, 10);
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let dayDesc = "";
    let nightDesc = "";

    forecast.list.forEach(item => {
        if (item.dt_txt.startsWith(todayDateStr)) {
            const t = item.main.temp;
            if (t < min) min = t;
            if (t > max) max = t;

            const hour = new Date(item.dt_txt).getHours();
            if (hour === 12) {
                dayDesc = item.weather[0].description;
            }
            if (hour === 21) {
                nightDesc = item.weather[0].description;
            }
        }
    });

    if (min === Number.POSITIVE_INFINITY) {
        // fallback if for some reason date not found
        min = current.main.temp_min;
        max = current.main.temp_max;
    }

    todayHighEl.textContent = `${Math.round(max)}°C`;
    todayLowEl.textContent = `${Math.round(min)}°C`;
    todayDayDescEl.textContent = dayDesc || current.weather[0].description;
    todayNightDescEl.textContent = nightDesc || "Clear / variable";

    todaySummaryText.textContent = `Expect a high of ${Math.round(max)}°C and a low of ${Math.round(min)}°C. Overall: ${current.weather[0].description}.`;

    // Preview of next few hours
    todayHourlyPreview.innerHTML = "";
    const nextHours = forecast.list.slice(0, 4);
    nextHours.forEach(item => {
        const dt = new Date(item.dt_txt);
        const card = createHourCard(dt, item.main.temp, item.weather[0].icon, item.weather[0].description);
        todayHourlyPreview.appendChild(card);
    });
}

function renderHourly(forecast) {
    hourlyContainer.innerHTML = "";
    const next8 = forecast.list.slice(0, 8);
    next8.forEach(item => {
        const dt = new Date(item.dt_txt);
        const card = createHourCard(dt, item.main.temp, item.weather[0].icon, item.weather[0].description);
        hourlyContainer.appendChild(card);
    });
}

function createHourCard(dt, temp, icon, desc) {
    const card = document.createElement("div");
    card.className = "hour-card";

    const timeEl = document.createElement("div");
    timeEl.className = "time";
    timeEl.textContent = dt.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit"
    });

    const img = document.createElement("img");
    img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    img.alt = desc;

    const tempEl = document.createElement("div");
    tempEl.className = "temp";
    tempEl.textContent = `${Math.round(temp)}°C`;

    const descEl = document.createElement("div");
    descEl.textContent = desc;

    card.appendChild(timeEl);
    card.appendChild(img);
    card.appendChild(tempEl);
    card.appendChild(descEl);

    return card;
}

function renderDaily(forecast) {
    // Group every 8 entries (24 hours) into one day
    const byDay = {};

    forecast.list.forEach(item => {
        const dateStr = item.dt_txt.slice(0, 10);
        if (!byDay[dateStr]) {
            byDay[dateStr] = {
                temps: [],
                icons: [],
                descriptions: []
            };
        }
        byDay[dateStr].temps.push(item.main.temp);
        byDay[dateStr].icons.push(item.weather[0].icon);
        byDay[dateStr].descriptions.push(item.weather[0].description);
    });

    const days = Object.keys(byDay).slice(0, 5); // next 5 days

    dailyContainer.innerHTML = "";
    days.forEach(dateStr => {
        const data = byDay[dateStr];
        const min = Math.round(Math.min(...data.temps));
        const max = Math.round(Math.max(...data.temps));

        // Take icon and description from middle of the day
        const midIndex = Math.floor(data.icons.length / 2);
        const icon = data.icons[midIndex];
        const desc = data.descriptions[midIndex];

        const row = document.createElement("div");
        row.className = "day-row";

        const main = document.createElement("div");
        main.className = "day-main";

        const img = document.createElement("img");
        img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        img.alt = desc;

        const texts = document.createElement("div");
        const nameEl = document.createElement("div");
        nameEl.className = "day-name";
        nameEl.textContent = `${getDayName(dateStr)}, ${dateStr.slice(5)}`;

        const descEl = document.createElement("div");
        descEl.className = "day-desc";
        descEl.textContent = desc;

        texts.appendChild(nameEl);
        texts.appendChild(descEl);

        main.appendChild(img);
        main.appendChild(texts);

        const temps = document.createElement("div");
        temps.className = "day-temps";
        const maxEl = document.createElement("span");
        maxEl.textContent = `High: ${max}°C`;
        const minEl = document.createElement("span");
        minEl.textContent = `Low: ${min}°C`;
        temps.appendChild(maxEl);
        temps.appendChild(minEl);

        row.appendChild(main);
        row.appendChild(temps);

        dailyContainer.appendChild(row);
    });
}

function renderAirQuality(air) {
    if (!air.list || !air.list.length) {
        airQualityDetails.innerHTML = "<p>No air quality data available.</p>";
        return;
    }

    const entry = air.list[0];
    const aqi = entry.main.aqi;
    const comp = entry.components;

    airQualityDetails.innerHTML = `
        <h3>Index: ${getAQIDescription(aqi)} (${aqi})</h3>
        <p style="margin-top:6px;">Pollutant concentrations (μg/m³):</p>
        <ul style="margin-top:6px;font-size:0.86rem;line-height:1.4;">
            <li>PM2.5: ${comp.pm2_5}</li>
            <li>PM10: ${comp.pm10}</li>
            <li>O₃: ${comp.o3}</li>
            <li>NO₂: ${comp.no2}</li>
            <li>SO₂: ${comp.so2}</li>
            <li>CO: ${comp.co}</li>
        </ul>
    `;
}

function renderHealthSuggestions(current, air) {
    const temp = current.main.temp;
    const aqi = air.list && air.list.length ? air.list[0].main.aqi : null;
    let suggestions = [];

    if (temp < 10) {
        suggestions.push("It's quite cold. Wear a warm jacket.");
    } else if (temp > 30) {
        suggestions.push("Hot conditions. Stay hydrated and avoid direct sun at noon.");
    } else {
        suggestions.push("Comfortable temperature for outdoor activities.");
    }

    if (aqi) {
        const desc = getAQIDescription(aqi);
        if (aqi >= 4) {
            suggestions.push("Air quality is poor. Limit outdoor exercise, especially if you have asthma.");
        } else if (aqi === 3) {
            suggestions.push("Moderate air quality. Sensitive groups should be cautious.");
        } else {
            suggestions.push("Air quality is good for outdoor activities.");
        }
    }

    healthContent.innerHTML = `
        <p>Based on the current weather and air quality:</p>
        <ul style="margin-top:8px;font-size:0.86rem;line-height:1.4;">
            ${suggestions.map(s => `<li>${s}</li>`).join("")}
        </ul>
    `;
}

// -------------------------
// SEARCH HISTORY (localStorage)
// -------------------------

function loadSearchHistory() {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveSearchHistory(city) {
    const history = loadSearchHistory();
    // Remove existing occurrence
    const filtered = history.filter(item => item !== city);
    filtered.unshift(city); // add to start
    const limited = filtered.slice(0, 8); // keep last 8
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
    renderHistory();
}

function renderHistory() {
    const history = loadSearchHistory();
    historyListEl.innerHTML = "";
    if (!history.length) {
        historyListEl.textContent = "No searches yet.";
        return;
    }
    history.forEach(city => {
        const chip = document.createElement("button");
        chip.className = "history-chip";
        chip.textContent = city;
        chip.addEventListener("click", () => {
            fetchWeatherForCity(city);
        });
        historyListEl.appendChild(chip);
    });
}

// -------------------------
// FEEDBACK FORM (simple)
// -------------------------
feedbackForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // For now we just show a success message.
    feedbackSuccessEl.textContent = "Thank you for your feedback! (This form does not send data to a server yet.)";
    feedbackForm.reset();
    setTimeout(() => {
        feedbackSuccessEl.textContent = "";
    }, 4000);
});

// -------------------------
// NEWS FETCHING (NewsAPI)
// -------------------------

// -------------------------
// NEWS FETCHING (MediaStack API)
// -------------------------
async function fetchWeatherNews() {
    try {
        const url = `https://newsdata.io/api/1/news?apikey=YOUR_NEWSDATA_API_KEY&q=weather OR climate OR storm&language=en`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        renderNews(data.results || []);
    } catch (err) {
        console.error(err);
        newsContainer.innerHTML = "<p>Unable to load news.</p>";
    }
}

function renderNews(articles) {
    newsContainer.innerHTML = "";

    if (!articles.length) {
        newsContainer.innerHTML = "<p>No weather news available right now.</p>";
        return;
    }

    articles.forEach(article => {
        const card = document.createElement("article");
        card.className = "news-card";

        const img = document.createElement("img");
        img.src = article.image_url || "https://via.placeholder.com/150x100?text=Weather";
        img.alt = article.title;

        const content = document.createElement("div");
        content.className = "news-content";

        const title = document.createElement("div");
        title.className = "news-title";
        title.textContent = article.title;

        const desc = document.createElement("div");
        desc.className = "news-desc";
        desc.textContent = article.description || "";

        content.appendChild(title);
        content.appendChild(desc);

        card.appendChild(img);
        card.appendChild(content);

        card.addEventListener("click", () => {
            if (article.link) window.open(article.link, "_blank");
        });

        newsContainer.appendChild(card);
    });
}


// -------------------------
// INITIALISATION
// -------------------------

function init() {
    renderHistory();
    fetchWeatherNews();

    // Optional: load a default city just to show UI with real data.
    // You can change "Delhi" to any city you like.
    fetchWeatherForCity("Delhi");
}

document.addEventListener("DOMContentLoaded", init);
