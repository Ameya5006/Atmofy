# 🌦️ Atmofy — Real-Time Weather App

**Atmofy** is a simple, beginner-friendly web application that lets users check real-time weather updates for any city across the world.  
It uses the **OpenWeatherMap API** to fetch live weather data and the **Geolocation API** to detect your current location automatically.

---

## 🚀 Features

- 🔍 **Search by City Name** — Get instant weather details for any city  
- 📍 **Use My Location** — Auto-detects your current city and shows live weather  
- 🌡️ **Weather Details** — Temperature, humidity, wind speed, and condition  
- ☁️ **Dynamic Weather Icons** — Icons change based on actual conditions  
- ⚡ **Fast and Lightweight** — Built using only HTML, CSS, and Vanilla JS  
- 🎨 **Modern UI** — Clean gradient background and smooth animations  

---

## 🧰 Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **APIs Used** | [OpenWeatherMap API](https://openweathermap.org/api), [Browser Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) |
| **Tools** | Visual Studio Code, Live Server Extension |

---

## 🏗️ Project Structure

```
weather/
│
├── index.html              # Main HTML file
├── styles/
│   └── style.css           # All styling (layout, gradients, animations)
└── scripts/
    └── app.js              # JavaScript logic (API calls, DOM updates)
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/weather.git
cd weather
```

### 2️⃣ Add your OpenWeatherMap API key
1. Create a free account at [https://openweathermap.org/api](https://openweathermap.org/api).  
2. Copy your API key from the dashboard.  
3. Open `scripts/app.js` and replace:
   ```js
   const API_KEY = "YOUR_API_KEY_HERE";
   ```
   with your actual key inside quotes.

### 3️⃣ Run the project
You can open `index.html` directly in your browser, or use VS Code’s Live Server extension:
- Right-click `index.html` → **Open with Live Server**

---

## 💻 Usage

1. Enter a city name and click **Search**  
2. Or click **📍 Use My Location** to fetch your location automatically  
3. View temperature, humidity, and weather condition instantly

---

## 🧩 Example API Call

```bash
https://api.openweathermap.org/data/2.5/weather?q=Delhi&units=metric&appid=YOUR_API_KEY
```

Response snippet:
```json
{
  "name": "Delhi",
  "weather": [{"main": "Clouds", "description": "scattered clouds"}],
  "main": {"temp": 29.5, "humidity": 60},
  "wind": {"speed": 2.6}
}
```

---

## 📸 Screenshots (Optional)
Add a few screenshots here once your app UI looks good:
```
/screenshots/homepage.png
/screenshots/location_search.png
```

---

## 🔮 Future Enhancements

- 🌈 Add weather-based animated backgrounds  
- 🕐 Show 5-day forecast  
- 💾 Save last searched city using localStorage  
- 📱 Make it fully responsive for mobile devices  
- 🌙 Add dark/light mode toggle  

---

## 🧠 Learning Outcomes

This project helped me practice:
- Using **Fetch API** and `async/await`
- Handling API responses and errors
- DOM manipulation and event handling
- Understanding **BOM** (Browser Object Model)
- Styling with gradients, flexbox, and transitions

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to fork this repository and submit a pull request.

---

## 🧑‍💻 Author

**Your Name**  
📧 your.email@example.com  
🌐 [GitHub Profile](https://github.com/your-username)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

⭐ *If you like this project, give it a star on GitHub — it keeps me motivated!* ⭐
