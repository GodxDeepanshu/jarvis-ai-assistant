/**
 * JARVIS Holographic HUD Orchestrator
 * Connects Voice Engine, 4K Satellite Reconnaissance, Tactical City Cameras, and Telemetry.
 */

let globe = null;
let satMap = null;
let satMarker = null;
let activeCity = null;
let activeMode = "sat"; // "sat", "street", "flir"
let synth = window.speechSynthesis;
let recognition = null;
let isListening = false;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize 4K 3D Globe
  globe = new PlanetaryGlobeVisualizer("three-globe-container", onCityClicked);

  // 2. Fetch Initial Cities & News
  loadPlanetaryCities();
  loadGlobalNews();
  loadSystemTelemetry();

  // 3. Setup Telemetry & News Polling
  setInterval(loadSystemTelemetry, 3500);
  setInterval(loadGlobalNews, 30000);
  startHudClock();

  // 4. Setup Speech Recognition
  setupVoiceRecognition();

  // 5. Setup Form Commands
  document.getElementById("command-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("command-input");
    const query = input.value.trim();
    if (query) {
      dispatchCommand(query);
      input.value = "";
    }
  });

  // Modal Close
  document.getElementById("close-modal-btn").addEventListener("click", closeCameraModal);
});

// HUD Microsecond Clock
function startHudClock() {
  const tsEl = document.getElementById("hud-live-timestamp");
  setInterval(() => {
    if (tsEl) {
      const d = new Date();
      tsEl.innerText = `UTC: ${d.toISOString().replace("T", " ").replace("Z", "")}`;
    }
  }, 100);
}

// Load Cities
async function loadPlanetaryCities() {
  try {
    const res = await fetch("/api/cities");
    const cities = await res.json();
    globe.loadCities(cities);
    renderCityList(cities);
  } catch (err) {
    console.error("Failed to load planetary cities:", err);
  }
}

// Render City Sidebar
function renderCityList(cities) {
  const container = document.getElementById("cities-list");
  container.innerHTML = "";
  cities.forEach((city) => {
    const card = document.createElement("div");
    card.className = "city-card";
    card.innerHTML = `
      <div class="city-card-header">
        <span class="city-name">${city.name}</span>
        <span class="city-country">${city.country}</span>
      </div>
      <div class="city-time">LOCAL TIME: ${city.local_time}</div>
      <div style="font-size: 0.72rem; color: #8ec3db; margin-top: 4px;">
        ${city.weather_condition} | ${city.weather_temp_c}°C | AQI: ${city.air_quality_index}
      </div>
    `;
    card.addEventListener("click", () => {
      onCityClicked(city);
    });
    container.appendChild(card);
  });
}

// City Selected Handler
function onCityClicked(city) {
  activeCity = city;
  globe.focusCity(city);
  openCameraModal(city);

  speakJarvis(
    `Reconnaissance optical feed locked on ${city.name}, ${city.country}. Local temperature is ${city.weather_temp_c} degrees Celsius. 4K high-resolution satellite reconnaissance online, sir.`
  );
}

// Open Camera Viewfinder Modal
function openCameraModal(city) {
  activeCity = city;
  const modal = document.getElementById("camera-modal");
  document.getElementById("modal-city-name").innerText = `${city.name.toUpperCase()} RECONNAISSANCE FEED`;
  document.getElementById("modal-camera-name").innerText = city.camera_name;
  document.getElementById("stat-pop").innerText = city.population;
  document.getElementById("stat-time").innerText = city.local_time;
  document.getElementById("stat-coords").innerText = `${city.lat.toFixed(4)}°, ${city.lon.toFixed(4)}°`;
  document.getElementById("stat-weather").innerText = `${city.weather_condition} (${city.weather_temp_c}°C)`;

  // Update Street Cam image
  const streetImg = document.getElementById("street-cam-img");
  streetImg.src = city.camera_fallback_image;

  modal.classList.add("active");

  // Initialize or update Leaflet 4K Satellite Recon Map
  initSatelliteMap(city.lat, city.lon);

  // Default to 4K Satellite view
  switchCameraMode("sat");
}

function initSatelliteMap(lat, lon) {
  const mapContainer = document.getElementById("sat-map-container");

  if (!satMap) {
    satMap = L.map("sat-map-container", {
      zoomControl: true,
      attributionControl: false,
    }).setView([lat, lon], 14);

    // 4K High-Resolution Esri World Imagery Satellite Tiles
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        subdomains: ["server", "services"],
      }
    ).addTo(satMap);

    satMarker = L.circleMarker([lat, lon], {
      radius: 12,
      color: "#00f0ff",
      fillColor: "#00f0ff",
      fillOpacity: 0.4,
      weight: 2,
    }).addTo(satMap);
  } else {
    setTimeout(() => {
      satMap.invalidateSize();
      satMap.flyTo([lat, lon], 14, { duration: 1.5 });
      if (satMarker) {
        satMarker.setLatLng([lat, lon]);
      }
    }, 200);
  }
}

// Switch Optical Modes: Satellite, Street, FLIR
function switchCameraMode(mode) {
  activeMode = mode;
  const viewfinder = document.getElementById("camera-viewfinder");
  const satContainer = document.getElementById("sat-map-container");
  const streetContainer = document.getElementById("street-cam-container");
  const telemText = document.getElementById("cam-telemetry-text");
  const sensorType = document.getElementById("hud-sensor-type");

  document.querySelectorAll(".mode-tab-btn").forEach((b) => b.classList.remove("active"));

  if (mode === "sat") {
    document.getElementById("btn-mode-sat").classList.add("active");
    viewfinder.classList.remove("flir-active");
    satContainer.style.display = "block";
    streetContainer.style.display = "none";
    telemText.innerText = "ORBITAL RECON // 4K SATELLITE MULTISPECTRAL // RECON ACTIVE";
    sensorType.innerText = "SENSOR: ESRI 4K MULTISPECTRAL";
    if (satMap) {
      setTimeout(() => satMap.invalidateSize(), 100);
    }
  } else if (mode === "street") {
    document.getElementById("btn-mode-street").classList.add("active");
    viewfinder.classList.remove("flir-active");
    satContainer.style.display = "none";
    streetContainer.style.display = "block";
    telemText.innerText = "TACTICAL OPTICAL CAM // 4K PANORAMA // HIGH RESOLUTION";
    sensorType.innerText = "SENSOR: TACTICAL RGB SENSOR";
  } else if (mode === "flir") {
    document.getElementById("btn-mode-flir").classList.add("active");
    viewfinder.classList.add("flir-active");
    satContainer.style.display = "none";
    streetContainer.style.display = "block";
    telemText.innerText = "THERMAL FLIR // LONG-WAVE INFRARED (LWIR) // TARGET LOCK";
    sensorType.innerText = "SENSOR: INFRARED FLIR 8-14 µm";
  }
}

function closeCameraModal() {
  const modal = document.getElementById("camera-modal");
  modal.classList.remove("active");
}

// Load Breaking News
async function loadGlobalNews() {
  try {
    const res = await fetch("/api/news");
    const news = await res.json();
    const marquee = document.getElementById("ticker-content");
    const text = news.map((n) => `[${n.category}] ${n.headline} (${n.source})`).join("  ///  ");
    marquee.innerText = text;
  } catch (err) {
    console.error("News fetch error:", err);
  }
}

// Load System Telemetry
async function loadSystemTelemetry() {
  try {
    const res = await fetch("/api/telemetry");
    const data = await res.json();

    document.getElementById("telem-cpu").innerText = `${data.cpu_usage_percent}%`;
    document.getElementById("telem-ram").innerText = `${data.ram_percent}%`;
    document.getElementById("telem-power").innerText = `${data.power_percent}%`;
    document.getElementById("telem-uptime").innerText = `${Math.floor(data.system_uptime_seconds / 60)}m`;
  } catch (err) {
    console.error("Telemetry error:", err);
  }
}

// Setup Speech Recognition
function setupVoiceRecognition() {
  const micBtn = document.getElementById("mic-btn");
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRec) {
    micBtn.title = "Speech recognition not supported in this browser";
    return;
  }

  recognition = new SpeechRec();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add("active-listening");
    document.getElementById("command-input").placeholder = "Listening to your voice command, sir...";
    animateAudioWave(true);
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove("active-listening");
    document.getElementById("command-input").placeholder = "Ask J.A.R.V.I.S. anything or speak command...";
    animateAudioWave(false);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("command-input").value = transcript;
    dispatchCommand(transcript);
  };

  micBtn.addEventListener("click", () => {
    if (!isListening) {
      try {
        recognition.start();
      } catch (e) {
        console.warn(e);
      }
    } else {
      recognition.stop();
    }
  });
}

// Dispatch Natural Language Command
async function dispatchCommand(query) {
  appendLog("USER", query);
  try {
    const res = await fetch("/api/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();

    appendLog("JARVIS", data.speech);
    speakJarvis(data.speech);

    if (data.action === "FOCUS_CITY" && data.city_data) {
      onCityClicked(data.city_data);
    }
  } catch (err) {
    console.error("Command error:", err);
  }
}

function speakJarvis(text) {
  if (!synth) return;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 0.95;

  const voices = synth.getVoices();
  const jarvisVoice = voices.find(
    (v) => v.lang.includes("en-GB") || v.name.includes("UK") || v.name.includes("George") || v.name.includes("Daniel")
  );
  if (jarvisVoice) {
    utterance.voice = jarvisVoice;
  }

  animateAudioWave(true);
  utterance.onend = () => animateAudioWave(false);
  synth.speak(utterance);
}

function animateAudioWave(active) {
  const bars = document.querySelectorAll(".wave-bar");
  bars.forEach((bar) => {
    if (active) {
      bar.style.height = `${Math.floor(Math.random() * 20 + 4)}px`;
    } else {
      bar.style.height = "6px";
    }
  });
}

function appendLog(sender, message) {
  const logBox = document.getElementById("hud-log-box");
  const entry = document.createElement("div");
  entry.style.marginBottom = "8px";
  entry.style.fontSize = "0.78rem";
  entry.style.fontFamily = "var(--font-mono)";

  if (sender === "USER") {
    entry.innerHTML = `<span style="color: var(--hud-orange); font-weight: bold;">[USER]:</span> ${message}`;
  } else {
    entry.innerHTML = `<span style="color: var(--hud-cyan); font-weight: bold;">[J.A.R.V.I.S.]:</span> ${message}`;
  }
  logBox.appendChild(entry);
  logBox.scrollTop = logBox.scrollHeight;
}
