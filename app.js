// -------------------- API KEY --------------------
const apiKey = "4e11074eb6d5290804e8e991ab687fe6";

// -------------------- DOM ELEMENTS --------------------
const cityEl = document.getElementById("city");
const dateEl = document.getElementById("date");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const hourlyEl = document.getElementById("hourly");
const tomorrowEl = document.getElementById("tomorrow");
const moodEl = document.getElementById("mood");
const illustration = document.getElementById("illustration");

const fog = document.getElementById("fog");
const rain = document.getElementById("rain");

const input = document.getElementById("cityInput");
const btn = document.getElementById("searchBtn");

// -------------------- ICONS & MOODS --------------------
const icons = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Smoke: "🌫️",
};

const moodMap = {
  Clear: "A calm and peaceful atmosphere surrounds the city.",
  Clouds: "A quiet mood under drifting clouds.",
  Rain: "A soothing rain settles gently over the streets.",
  Mist: "The air feels heavy and muted right now.",
  Smoke: "A dense stillness hangs quietly in the air.",
  Thunderstorm: "The atmosphere feels restless and electric."
};

// -------------------- BEFORE SEARCH: LOCAL TIME --------------------
function setInitialIconByLocalTime() {
  const hour = new Date().getHours();
  illustration.textContent = hour >= 6 && hour < 18 ? "☀️" : "🌙";
}
setInitialIconByLocalTime();

// -------------------- EVENT LISTENER --------------------
btn.addEventListener("click", () => {
  const city = input.value.trim();
  if (city) loadWeather(city);
});

// -------------------- MAIN API CALL --------------------
async function loadWeather(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
  );
  const data = await res.json();

  if (data.cod !== 200) return alert("City not found");

  cityEl.textContent = data.name;
  dateEl.textContent = new Date().toDateString();
  tempEl.textContent = Math.round(data.main.temp);
  descEl.textContent = data.weather[0].description;
  feelsEl.textContent = `Feels like ${Math.round(data.main.feels_like)}°`;
  humidityEl.textContent = data.main.humidity;
  windEl.textContent = data.wind.speed;

  const condition = data.weather[0].main;

  // 🌅 Day / 🌙 Night check using sunrise/sunset
  const now = Date.now() / 1000;
  illustration.textContent = now > data.sys.sunset || now < data.sys.sunrise
    ? "🌙"
    : icons[condition] || "☀️";

  moodEl.textContent = moodMap[condition] || "The atmosphere feels calm.";

  localStorage.setItem("lastWeather", JSON.stringify({
    city: data.name,
    temp: Math.round(data.main.temp),
    condition,
  }));

  applyAtmosphere(condition);
  loadForecast(data.coord.lat, data.coord.lon);
}

// -------------------- FORECAST --------------------
async function loadForecast(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  );
  const data = await res.json();

  hourlyEl.innerHTML = "";
  data.list.slice(0, 6).forEach((h, i) => {
    const hour = new Date(h.dt_txt).getHours();
    hourlyEl.innerHTML += `
      <div class="hour ${i === 0 ? "current" : ""}">
        <p>${i === 0 ? "Now" : hour + ":00"}</p>
        <p>${icons[h.weather[0].main] || "🌙"}</p>
        <p>${Math.round(h.main.temp)}°</p>
      </div>
    `;
  });

  const t = data.list[8];
  tomorrowEl.textContent = `Tomorrow: ${t.weather[0].description} · ${Math.round(t.main.temp)}°`;
}

// -------------------- EFFECTS --------------------
function applyAtmosphere(condition) {
  fog.classList.add("hidden");
  rain.classList.add("hidden");

  if (["Mist", "Smoke"].includes(condition)) fog.classList.remove("hidden");
  if (["Rain", "Thunderstorm"].includes(condition)) rain.classList.remove("hidden");
}
