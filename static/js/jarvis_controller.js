/**
 * JARVIS Master Controller: Stark Industries Global Intelligence System.
 * Connects 3D Earth Layers (Satellites, Aircraft, News), Voice AI, and Context Dossiers.
 */

let globeCore = null;
let synth = window.speechSynthesis;
let recognition = null;
let isListening = false;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize 3D Photorealistic Globe
  globeCore = new StarkGlobeCore("three-globe-container", onObjectSelected);

  // 2. Fetch Live Feeds
  loadSatellitesFeed();
  loadAircraftFeed();
  loadNewsIntelligenceFeed();
  loadSystemTelemetry();

  // 3. Setup Recurring Polling
  setInterval(loadAircraftFeed, 25000);   // OpenSky ADS-B refresh
  setInterval(loadSatellitesFeed, 60000); // Orbital recalculation
  setInterval(loadSystemTelemetry, 4000); // Telemetry refresh
  startSystemClocks();

  // 4. Setup Speech Recognition & Form
  setupVoiceRecognition();
  setupCommandForm();
});

// Real-Time System Clocks (Local & UTC)
function startSystemClocks() {
  const localEl = document.getElementById("clock-local");
  const utcEl = document.getElementById("clock-utc");

  setInterval(() => {
    const now = new Date();
    if (localEl) localEl.innerText = now.toLocaleTimeString();
    if (utcEl) utcEl.innerText = now.toISOString().substring(11, 19) + " UTC";
  }, 1000);
}

// ==========================================
// DATA INGESTION
// ==========================================

async function loadSatellitesFeed() {
  try {
    const res = await fetch("/api/satellites");
    const data = await res.json();
    globeCore.satelliteLayer.loadSatellites(data.satellites);
    document.getElementById("count-satellites").innerText = data.total;
    document.getElementById("status-celestrak").innerText = "CONNECTED";
    document.getElementById("status-celestrak").className = "status-indicator status-online";
  } catch (err) {
    console.error("Satellite feed error:", err);
    document.getElementById("status-celestrak").innerText = "OFFLINE";
    document.getElementById("status-celestrak").className = "status-indicator status-offline";
  }
}

async function loadAircraftFeed() {
  try {
    const res = await fetch("/api/aircraft");
    const data = await res.json();
    globeCore.aircraftLayer.loadFlights(data.flights);
    document.getElementById("count-aircraft").innerText = data.total;
    document.getElementById("status-opensky").innerText = "LIVE ADS-B";
    document.getElementById("status-opensky").className = "status-indicator status-online";
  } catch (err) {
    console.error("Aircraft feed error:", err);
    document.getElementById("status-opensky").innerText = "DEGRADED";
    document.getElementById("status-opensky").className = "status-indicator status-warning";
  }
}

async function loadNewsIntelligenceFeed() {
  try {
    const res = await fetch("/api/news/events");
    const data = await res.json();
    globeCore.newsLayer.loadEvents(data.events);
    document.getElementById("count-news").innerText = data.total;
    renderNewsFeedList(data.events);
  } catch (err) {
    console.error("News feed error:", err);
  }
}

async function loadSystemTelemetry() {
  try {
    const res = await fetch("/api/telemetry");
    const data = await res.json();
    document.getElementById("telem-cpu").innerText = `${data.cpu_usage_percent}%`;
    document.getElementById("telem-ram").innerText = `${data.ram_percent}%`;
    document.getElementById("telem-power").innerText = `${data.power_percent}%`;
  } catch (err) {
    console.error("Telemetry error:", err);
  }
}

function renderNewsFeedList(events) {
  const container = document.getElementById("news-feed-list");
  if (!container) return;
  container.innerHTML = "";

  events.forEach((ev) => {
    const item = document.createElement("div");
    item.className = "intelligence-item";
    item.innerHTML = `
      <div class="item-title">${ev.title}</div>
      <div class="item-meta">
        <span class="category-tag tag-${ev.category}">${ev.category.replace("_", " ").toUpperCase()}</span>
        <span>${ev.location_name} • ${ev.timestamp}</span>
      </div>
    `;
    item.addEventListener("click", () => {
      onObjectSelected("news", ev);
    });
    container.appendChild(item);
  });
}

// ==========================================
// CONTEXTUAL SELECTION & INTELLIGENCE DOSSIER
// ==========================================

function onObjectSelected(type, data) {
  const panel = document.getElementById("right-dossier-body");
  const header = document.getElementById("dossier-title");

  if (type === "satellite") {
    header.innerText = "ORBITAL TELEMETRY // SATELLITE";
    globeCore.flyToCoordinates(data.lat, data.lon, 230);

    panel.innerHTML = `
      <div class="dossier-section">
        <div class="dossier-main-title">${data.name}</div>
        <div class="dossier-badge">NORAD ID: ${data.norad_id} • CATEGORY: ${data.category.toUpperCase()}</div>
      </div>

      <div class="dossier-grid">
        <div class="metric-card">
          <div class="metric-lbl">CURRENT ALTITUDE</div>
          <div class="metric-val">${data.alt_km} km</div>
        </div>
        <div class="metric-card">
          <div class="metric-lbl">ORBITAL VELOCITY</div>
          <div class="metric-val">${data.speed_kms} km/s</div>
        </div>
        <div class="metric-card">
          <div class="metric-lbl">INCLINATION</div>
          <div class="metric-val">${data.inclination_deg}°</div>
        </div>
        <div class="metric-card">
          <div class="metric-lbl">ORBITAL PERIOD</div>
          <div class="metric-val">${data.period_minutes} min</div>
        </div>
      </div>

      <div class="dossier-section">
        <div class="section-heading">GEODETIC SUB-SATELLITE POINT</div>
        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #b0e3ff;">
          LAT: ${data.lat}° | LON: ${data.lon}°
        </div>
      </div>

      <button id="btn-project-orbit" class="action-btn-primary">
        PROJECT 90-MIN ORBITAL TRAJECTORY
      </button>

      <div class="dossier-source-note">DATA SOURCE: ${data.data_source}</div>
    `;

    document.getElementById("btn-project-orbit").addEventListener("click", async () => {
      try {
        const res = await fetch(`/api/satellites/trajectory/${data.norad_id}`);
        const arc = await res.json();
        globeCore.satelliteLayer.renderTrajectory(arc.trajectory);
        speakJarvis(`Orbital trajectory computed for ${data.name}. Rendering 90-minute path on the globe, sir.`);
      } catch (e) {
        console.error(e);
      }
    });

    speakJarvis(`Locking telemetry on ${data.name}, NORAD ID ${data.norad_id}. Altitude is ${data.alt_km} kilometers.`);
  } else if (type === "aircraft") {
    header.innerText = "AIRBORNE TELEMETRY // ADS-B";
    globeCore.flyToCoordinates(data.lat, data.lon, 190);

    panel.innerHTML = `
      <div class="dossier-section">
        <div class="dossier-main-title">CALLSIGN: ${data.callsign}</div>
        <div class="dossier-badge">ICAO24: ${data.icao24} • REGION: ${data.country}</div>
      </div>

      <div class="dossier-grid">
        <div class="metric-card">
          <div class="metric-lbl">ALTITUDE</div>
          <div class="metric-val">${data.altitude_ft.toLocaleString()} ft (${data.altitude_m} m)</div>
        </div>
        <div class="metric-card">
          <div class="metric-lbl">GROUND SPEED</div>
          <div class="metric-val">${data.ground_speed_kts} kts (${data.ground_speed_kmh} km/h)</div>
        </div>
        <div class="metric-card">
          <div class="metric-lbl">TRUE HEADING</div>
          <div class="metric-val">${data.heading_deg}°</div>
        </div>
        <div class="metric-card">
          <div class="metric-lbl">VERTICAL RATE</div>
          <div class="metric-val">${data.vertical_rate_ms} m/s</div>
        </div>
      </div>

      <div class="dossier-section">
        <div class="section-heading">TRANSPONDER POSITION</div>
        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #ffd700;">
          LAT: ${data.lat}° | LON: ${data.lon}°
        </div>
      </div>

      <div class="dossier-source-note">SOURCE: OpenSky Network ADS-B Stream</div>
    `;

    speakJarvis(`Flight ${data.callsign} targeted. Cruising altitude ${data.altitude_ft.toLocaleString()} feet, ground speed ${data.ground_speed_kts} knots.`);
  } else if (type === "news") {
    header.innerText = "SITUATIONAL INTELLIGENCE // INVESTIGATION";
    globeCore.flyToCoordinates(data.lat, data.lon, 200);

    const inv = data.investigation;
    panel.innerHTML = `
      <div class="dossier-section">
        <div class="dossier-main-title">${data.title}</div>
        <div class="dossier-badge">REGION: ${data.location_name} • SOURCE: ${data.source}</div>
      </div>

      <div class="dossier-section">
        <div class="section-heading">WHAT HAPPENED</div>
        <div class="body-text">${inv.what_happened}</div>
      </div>

      <div class="dossier-section">
        <div class="section-heading">WHY IT MATTERS</div>
        <div class="body-text">${inv.why_it_matters}</div>
      </div>

      <div class="dossier-section">
        <div class="section-heading">KEY ORGANIZATIONS & ENTITIES</div>
        <div class="tags-container">
          ${inv.key_entities.map((e) => `<span class="entity-pill">${e}</span>`).join(" ")}
        </div>
      </div>

      <div class="dossier-section">
        <div class="section-heading">CHRONOLOGICAL EVENT TIMELINE</div>
        <div class="timeline-list">
          ${inv.timeline.map((t) => `<div class="timeline-item">• ${t}</div>`).join("")}
        </div>
      </div>

      <div class="dossier-section">
        <div class="section-heading">FACTS VS. SPECULATION</div>
        <div class="fact-box"><strong>CONFIRMED:</strong> ${inv.facts_vs_speculation.confirmed_facts}</div>
        <div class="spec-box"><strong>SPECULATION:</strong> ${inv.facts_vs_speculation.speculation}</div>
      </div>

      <a href="${data.source_url}" target="_blank" class="action-btn-primary" style="display: block; text-align: center; text-decoration: none;">
        OPEN ORIGINAL SOURCE REPOSITORY
      </a>
    `;

    speakJarvis(`Investigation dossier loaded for ${data.title}. Located at ${data.location_name}. Displaying facts, timeline, and strategic impact.`);
  }
}

// ==========================================
// VOICE ASSISTANT & COMMAND DISPATCH
// ==========================================

function setupCommandForm() {
  const form = document.getElementById("command-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("command-input");
    const val = input.value.trim();
    if (val) {
      dispatchCommand(val);
      input.value = "";
    }
  });
}

function setupVoiceRecognition() {
  const micBtn = document.getElementById("mic-btn");
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRec) {
    micBtn.title = "Voice recognition not supported";
    return;
  }

  recognition = new SpeechRec();
  recognition.continuous = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add("active-listening");
    document.getElementById("command-input").placeholder = "JARVIS listening to your command, sir...";
    animateWave(true);
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove("active-listening");
    document.getElementById("command-input").placeholder = "Issue voice or text command to JARVIS...";
    animateWave(false);
  };

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    document.getElementById("command-input").value = text;
    dispatchCommand(text);
  };

  micBtn.addEventListener("click", () => {
    if (!isListening) {
      try {
        recognition.start();
      } catch (err) {
        console.warn(err);
      }
    } else {
      recognition.stop();
    }
  });
}

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

    // Execute interface actions
    if (data.action === "TRACK_SATELLITE" && data.target_data) {
      onObjectSelected("satellite", data.target_data);
    } else if (data.action === "FOCUS_AND_FILTER_SATELLITES") {
      globeCore.flyToCoordinates(data.lat, data.lon, 230);
    } else if (data.action === "TOGGLE_AIRCRAFT_LAYER") {
      toggleLayer("aircraft", true);
    } else if (data.action === "OPEN_NEWS_DOSSIER" && data.event_data) {
      onObjectSelected("news", data.event_data);
    } else if (data.action === "FOCUS_LOCATION" || data.action === "FOCUS_CITY") {
      globeCore.flyToCoordinates(data.lat, data.lon, 200);
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

  animateWave(true);
  utterance.onend = () => animateWave(false);
  synth.speak(utterance);
}

function animateWave(active) {
  const bars = document.querySelectorAll(".wave-bar");
  bars.forEach((bar) => {
    bar.style.height = active ? `${Math.floor(Math.random() * 20 + 4)}px` : "6px";
  });
}

function appendLog(sender, message) {
  const box = document.getElementById("hud-log-box");
  if (!box) return;
  const entry = document.createElement("div");
  entry.style.marginBottom = "8px";
  entry.style.fontSize = "0.76rem";
  entry.style.fontFamily = "var(--font-mono)";

  if (sender === "USER") {
    entry.innerHTML = `<span style="color: var(--hud-orange); font-weight: bold;">[OPERATOR]:</span> ${message}`;
  } else {
    entry.innerHTML = `<span style="color: var(--hud-cyan); font-weight: bold;">[J.A.R.V.I.S.]:</span> ${message}`;
  }
  box.appendChild(entry);
  box.scrollTop = box.scrollHeight;
}

// ==========================================
// LAYER & FILTER CONTROLS
// ==========================================

function toggleLayer(layerName, forceState) {
  if (layerName === "satellites") {
    const isVis = forceState !== undefined ? forceState : !globeCore.satelliteLayer.visible;
    globeCore.satelliteLayer.toggleVisibility(isVis);
    document.getElementById("btn-toggle-sats").classList.toggle("active", isVis);
  } else if (layerName === "aircraft") {
    const isVis = forceState !== undefined ? forceState : !globeCore.aircraftLayer.visible;
    globeCore.aircraftLayer.toggleVisibility(isVis);
    document.getElementById("btn-toggle-planes").classList.toggle("active", isVis);
  } else if (layerName === "news") {
    const isVis = forceState !== undefined ? forceState : !globeCore.newsLayer.visible;
    globeCore.newsLayer.toggleVisibility(isVis);
    document.getElementById("btn-toggle-news").classList.toggle("active", isVis);
  }
}

function filterSatellites(category) {
  globeCore.satelliteLayer.setCategoryFilter(category);
  document.querySelectorAll(".cat-filter-btn").forEach((b) => b.classList.remove("active"));
  const btn = document.getElementById(`btn-cat-${category}`);
  if (btn) btn.classList.add("active");
}

function quickFly(lat, lon, name) {
  globeCore.flyToCoordinates(lat, lon, 210);
  speakJarvis(`Navigating planetary observation perspective to ${name}, sir.`);
}
