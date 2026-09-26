// Base Backend URL
const API_BASE = "http://localhost:5000";

// Global Application State
let appState = {
    token: localStorage.getItem("token") || null,
    username: localStorage.getItem("username") || null,
    role: localStorage.getItem("role") || null,
    farms: [],
    activeFarmId: null,
    telemetryHistory: [],
    activeRegressor: "XGBoost",
    activeClassifier: "Voting Ensemble"
};

// ==========================================================
// 0. TOAST NOTIFICATION SYSTEM
// ==========================================================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconClass = "fa-circle-check";
    if (type === "warning") iconClass = "fa-triangle-exclamation";
    if (type === "error") iconClass = "fa-circle-xmark";
    
    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${message}</span>`;
    container.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================================
// 1. INITIALIZATION (No Auth - Direct Dashboard)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    // Skip auth — go straight to dashboard
    setupEventListeners();
    setupNavigation();
    initializeDashboard();
    spawnParticles();
});

// Hash-based SPA navigation
function setupNavigation() {
    // Wire nav items
    document.querySelectorAll(".nav-item[data-page]").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const page = link.getAttribute("data-page");
            navigateTo(page);
        });
    });

    // Handle hash on load
    const hash = window.location.hash.replace("#", "") || "dashboard";
    navigateTo(hash);

    window.addEventListener("hashchange", () => {
        const p = window.location.hash.replace("#", "") || "dashboard";
        navigateTo(p);
    });
}

function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    // Show target page
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add("active");

    // Update nav active state
    document.querySelectorAll(".nav-item").forEach(n => {
        n.classList.toggle("active", n.getAttribute("data-page") === page);
    });

    // Update hash without triggering hashchange loop
    if (window.location.hash !== `#${page}`) {
        window.history.replaceState(null, "", `#${page}`);
    }

    // Trigger page-specific data load
    if (page === "models") { loadModelPageData(); fetchLiveWeather(); }
    if (page === "sensors") loadSensorLogs();
}

// Spawn floating particles in background
function spawnParticles() {
    const container = document.getElementById("particles-container");
    if (!container) return;
    const count = 30;
    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.width = p.style.height = (Math.random() * 3 + 1) + "px";
        p.style.animationDuration = (Math.random() * 15 + 8) + "s";
        p.style.animationDelay = (Math.random() * 10) + "s";
        p.style.opacity = Math.random() * 0.5 + 0.1;
        container.appendChild(p);
    }
}



function setupEventListeners() {
    // Logout Click
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        // No-op since auth is disabled; just hide button or keep as refresh
        logoutBtn.addEventListener("click", () => window.location.reload());
    }
    
    // Active Farm Selector Change
    const farmSelector = document.getElementById("farm-selector");
    if (farmSelector) {
        farmSelector.addEventListener("change", (e) => {
            appState.activeFarmId = e.target.value;
            loadFarmDetails();
            refreshTelemetry();
        });
    }
    
    // Model Selectors Change
    const regressorSelector = document.getElementById("regressor-selector");
    if (regressorSelector) {
        regressorSelector.addEventListener("change", (e) => {
            appState.activeRegressor = e.target.value;
        });
    }
    
    const classifierSelector = document.getElementById("classifier-selector");
    if (classifierSelector) {
        classifierSelector.addEventListener("change", (e) => {
            appState.activeClassifier = e.target.value;
        });
    }
    
    // Simulator Button Click
    const simulateBtn = document.getElementById("simulate-step-btn");
    if (simulateBtn) {
        simulateBtn.addEventListener("click", triggerSimulationStep);
    }
    
    // Retrain Models Click
    const retrainBtn = document.getElementById("retrain-btn");
    if (retrainBtn) {
        retrainBtn.addEventListener("click", triggerModelRetraining);
    }
    
    // Add Field Modal Logic
    const addFieldBtn = document.getElementById("btn-add-field");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const addFieldModal = document.getElementById("add-field-modal");
    const addFieldForm = document.getElementById("add-field-form");
    
    if (addFieldBtn && addFieldModal) {
        addFieldBtn.addEventListener("click", () => addFieldModal.classList.remove("hidden"));
    }
    
    if (closeModalBtn && addFieldModal) {
        closeModalBtn.addEventListener("click", () => addFieldModal.classList.add("hidden"));
    }
    
    // Manual Override Button Logic
    const manualOverrideBtn = document.getElementById("manual-override-btn");
    if (manualOverrideBtn) {
        manualOverrideBtn.addEventListener("click", async () => {
            if (!appState.activeFarmId) return;
            const btnOrigText = manualOverrideBtn.innerHTML;
            manualOverrideBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            
            // Log manually locally and simulate an override
            const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const html = `
                <div class="timeline-item stagger-1">
                    <div class="timeline-dot" style="background: var(--color-orange); box-shadow: 0 0 10px var(--color-orange);"></div>
                    <div class="timeline-content">
                        <strong>MANUAL OVERRIDE: PUMP STARTED</strong>
                        <span>${ts}</span>
                        <p style="color: var(--color-orange);">Operator bypassed AI to manually start irrigation.</p>
                    </div>
                </div>
            `;
            const container = document.getElementById("timeline-container");
            const empty = container.querySelector(".timeline-empty");
            if (empty) empty.style.display = "none";
            container.insertAdjacentHTML("afterbegin", html);
            
            showToast(`Manual pump override activated for ${appState.activeFarmId}!`, "warning");
            
            setTimeout(() => {
                manualOverrideBtn.innerHTML = btnOrigText;
            }, 1000);
        });
    }
    
    if (addFieldForm) {
        addFieldForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = addFieldForm.querySelector("button[type='submit']");
            const origText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;
            
            const fieldName = document.getElementById("new-field-name").value;
            const cropType = document.getElementById("new-field-crop").value;
            const soilType = document.getElementById("new-field-soil").value;
            
            try {
                const res = await fetch(`${API_BASE}/api/farms`, {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        farm_id: "Farm_" + Math.random().toString(36).substr(2, 5).toUpperCase(),
                        name: fieldName,
                        crop_type: cropType,
                        soil_type: soilType
                    })
                });
                
                if(res.ok) {
                    addFieldModal.classList.add("hidden");
                    addFieldForm.reset();
                    // Refresh Dashboard
                    initializeDashboard();
                } else {
                    alert("Error adding field");
                }
            } catch(err) {
                console.error(err);
                alert("Error adding field");
            } finally {
                btn.innerHTML = origText;
                btn.disabled = false;
            }
        });
    }
}

// ==========================================================
// 2. AUTHENTICATION REMOVED — Public Access Mode
// ==========================================================

// Helper: HTTP Headers (no auth token)
function getAuthHeaders() {
    return { "Content-Type": "application/json" };
}

function handleLogout() {
    window.location.reload();
}


// ==========================================================
// 3. DASHBOARD OPERATIONS
// ==========================================================
async function initializeDashboard() {
    // Set default guest user info (no auth)
    const displayName = document.getElementById("user-display-name");
    if (displayName) displayName.textContent = "Guest";
    const profileName = document.getElementById("profile-name");
    if (profileName) profileName.textContent = "Guest";
    const profileRole = document.getElementById("profile-role");
    if (profileRole) profileRole.textContent = "Operator";
    
    try {
        // Fetch farms list (public endpoint)
        const response = await fetch(`${API_BASE}/api/farms`, {
            method: "GET",
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            console.warn("Could not load farms from API:", response.status);
            return;
        }
        
        const farms = await response.json();
        appState.farms = farms;
        
        // Setup dropdown
        const farmSelector = document.getElementById("farm-selector");
        if (!farmSelector) return;
        farmSelector.innerHTML = "";
        
        if (farms.length > 0) {
            farms.forEach(farm => {
                const opt = document.createElement("option");
                opt.value = farm.farm_id;
                opt.textContent = farm.name;
                farmSelector.appendChild(opt);
            });
            
            // Set first farm active
            appState.activeFarmId = farms[0].farm_id;
            const statFarms = document.getElementById("stat-farms-count");
            if (statFarms) statFarms.textContent = farms.length;
            
            loadFarmDetails();
            refreshTelemetry();
            fetchLiveWeather();
        } else {
            farmSelector.innerHTML = "<option>No farms found</option>";
        }
        
    } catch (err) {
        console.error("Initialization error:", err);
    }
}

async function fetchLiveWeather() {
    try {
        // Fetching live weather for default coordinates (New Delhi: 28.6139, 77.2090)
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&timezone=auto");
        if (!response.ok) return;
        const data = await response.json();
        const current = data.current;
        
        const temp = Math.round(current.temperature_2m);
        const humidity = current.relative_humidity_2m;
        const wind = Math.round(current.wind_speed_10m);
        const code = current.weather_code;
        const precipitation = current.precipitation || 0;

        // Store weather in appState for later use (smart prediction)
        appState.weather = { temp, humidity, wind, code, precipitation };
        
        // WMO Weather Codes to descriptions + emojis
        const weatherMap = {
            0: ["Clear Sky", "☀️"],
            1: ["Mainly Clear", "🌤️"], 2: ["Partly Cloudy", "⛅"], 3: ["Overcast", "☁️"],
            45: ["Foggy", "🌫️"], 48: ["Foggy", "🌫️"],
            51: ["Light Drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy Drizzle", "🌧️"],
            61: ["Light Rain", "🌧️"], 63: ["Moderate Rain", "🌧️"], 65: ["Heavy Rain", "⛈️"],
            80: ["Rain Showers", "🌦️"], 81: ["Rain Showers", "🌧️"], 82: ["Heavy Rain Showers", "⛈️"],
            95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm", "⛈️"], 99: ["Thunderstorm", "⛈️"]
        };
        const [weatherDesc, weatherEmoji] = weatherMap[code] || ["Sunny", "☀️"];
        const isRaining = code >= 51;
        
        // Update left panel weather widget
        const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
        setEl("weather-temp", `${temp}°C`);
        setEl("weather-desc", weatherDesc);
        setEl("weather-wind", `${wind} km/h`);
        setEl("weather-humidity", `${humidity}%`);
        
        // Update models page weather widget
        setEl("wx-temp2", `${temp}°C`);
        setEl("wx-humidity2", `${humidity}%`);
        setEl("wx-wind2", `${wind} km/h`);
        setEl("wx-desc2", weatherDesc);
        const icon2 = document.getElementById("wx-icon2");
        if (icon2) icon2.textContent = weatherEmoji;
        
        // Rain advisory
        const rainText = document.getElementById("wx-rain-text");
        if (rainText) {
            if (isRaining) {
                rainText.textContent = `It is currently raining (${weatherDesc}). You likely do NOT need to irrigate today — save water and let the rain do its job.`;
                document.getElementById("wx-rain-advisory").style.borderColor = "rgba(59,130,246,0.4)";
            } else if (humidity > 70) {
                rainText.textContent = `High humidity detected (${humidity}%). Soil may retain more moisture. Consider reducing irrigation.`;
            } else {
                rainText.textContent = `No rainfall expected. Monitor your soil moisture gauge regularly and irrigate if it drops below the target.`;
                document.getElementById("wx-rain-advisory").style.borderColor = "rgba(245,158,11,0.3)";
                document.getElementById("wx-rain-advisory").style.backgroundColor = "rgba(245,158,11,0.05)";
                document.getElementById("wx-rain-advisory").querySelector("p").style.color = "var(--color-orange)";
            }
        }
        
        // Generate smart irrigation prediction
        generateSmartPrediction(temp, humidity, precipitation, isRaining, code);
        
    } catch(err) {
        console.error("Weather fetch failed:", err);
        const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
        setEl("weather-desc", "Unavailable");
        setEl("wx-desc2", "Unavailable");
    }
}

function generateSmartPrediction(temp, humidity, precipitation, isRaining, code) {
    const emojiEl = document.getElementById("pred-emoji");
    const actionEl = document.getElementById("pred-action");
    const reasonEl = document.getElementById("pred-reason");
    const adviceList = document.getElementById("wx-advice-list");
    if (!emojiEl || !actionEl || !reasonEl) return;
    
    const activeFarm = appState.farms.find(f => f.farm_id === appState.activeFarmId);
    const cropType = activeFarm ? activeFarm.crop_type : "crops";
    const threshold = activeFarm ? activeFarm.moisture_threshold : 35;
    
    let advice = [];
    let action, reason, emoji, cardBg, cardBorder;
    
    if (isRaining || precipitation > 1.0) {
        emoji = "🌧️";
        action = "DO NOT Irrigate Today";
        reason = `It is currently raining outside. Your ${cropType} field is getting natural water. Switch off the pump to save electricity and water.`;
        cardBg = "rgba(59,130,246,0.08)";
        cardBorder = "rgba(59,130,246,0.3)";
        advice = [
            `🌧️ Rain detected — pump is not needed`,
            `💰 Estimated water saving today: ~80 litres/field`,
            `🌱 Rain is good for ${cropType} — let it absorb naturally`,
            `🔍 Check your field again in 3-4 hours after rain stops`
        ];
    } else if (temp > 38) {
        emoji = "🔥";
        action = "Irrigate Urgently";
        reason = `Very high temperature (${temp}°C) means your soil is drying out fast. Your ${cropType} needs water immediately or it may get heat stress.`;
        cardBg = "rgba(239,68,68,0.08)";
        cardBorder = "rgba(239,68,68,0.3)";
        advice = [
            `🔥 Heat alert — irrigate before 8 AM or after 6 PM`,
            `💧 Target moisture for ${cropType}: ${threshold}%`,
            `🌡️ Avoid mid-day irrigation as water evaporates quickly in heat`,
            `🌿 Check leaf condition — wilting means urgent watering needed`
        ];
    } else if (humidity > 75) {
        emoji = "💧";
        action = "Reduce Irrigation";
        reason = `Air humidity is high (${humidity}%). Soil will lose less water today. You can skip one irrigation cycle and check again tomorrow.`;
        cardBg = "rgba(16,185,129,0.08)";
        cardBorder = "rgba(16,185,129,0.3)";
        advice = [
            `✅ Conditions are comfortable for ${cropType}`,
            `📉 High humidity — consider reducing pump time by 30%`,
            `🌤️ Good day for field inspection`,
            `🔍 Check soil moisture manually before deciding`
        ];
    } else {
        emoji = "✅";
        action = "Normal Irrigation";
        reason = `Weather conditions are normal today. Follow your regular watering schedule for ${cropType}. Keep soil moisture near the target of ${threshold}%.`;
        cardBg = "rgba(16,185,129,0.05)";
        cardBorder = "rgba(16,185,129,0.15)";
        advice = [
            `🌱 Irrigate as per your regular schedule`,
            `💧 Maintain soil moisture near ${threshold}% for ${cropType}`,
            `🌅 Best time to irrigate: early morning (6–8 AM)`,
            `🔋 System running on AI Auto-Pilot — no action needed`
        ];
    }
    
    emojiEl.textContent = emoji;
    actionEl.textContent = action;
    actionEl.style.color = isRaining ? "var(--color-blue)" : temp > 38 ? "var(--color-red)" : "var(--color-green)";
    reasonEl.textContent = reason;
    
    const card = document.getElementById("ai-prediction-card");
    if (card) {
        card.style.background = cardBg;
        card.style.borderColor = cardBorder;
    }
    
    adviceList.innerHTML = advice.map(a => `<li style="padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04);">${a}</li>`).join("");
}



function loadFarmDetails() {
    const activeFarm = appState.farms.find(f => f.farm_id === appState.activeFarmId);
    if (activeFarm) {
        document.getElementById("farm-crop-val").textContent = activeFarm.crop_type;
        document.getElementById("farm-soil-val").textContent = activeFarm.soil_type;
        document.getElementById("farm-threshold-val").textContent = `${activeFarm.moisture_threshold}%`;
        
        // Node map
        const nodeMap = { "Farm_A": "Node-A31", "Farm_B": "Node-B90", "Farm_C": "Node-C14" };
        document.getElementById("farm-node-val").textContent = nodeMap[appState.activeFarmId] || "Node-" + Math.floor(Math.random()*100);
        
        // Dynamic Icon Based on Crop
        const iconDisplay = document.getElementById("crop-icon-display");
        const root = document.documentElement;
        
        if (iconDisplay) {
            let iconClass = "fa-wheat-awn";
            let primaryColor = "#bd52fc"; // default purple
            let secondaryColor = "#a32ef0";
            
            if (activeFarm.crop_type === "Rice") {
                iconClass = "fa-seedling";
                primaryColor = "#3b82f6"; // Blue
                secondaryColor = "#60a5fa";
            }
            else if (activeFarm.crop_type === "Maize") {
                iconClass = "fa-leaf";
                primaryColor = "#eab308"; // Yellow
                secondaryColor = "#fde047";
            }
            else if (activeFarm.crop_type === "Sugarcane") {
                iconClass = "fa-tree";
                primaryColor = "#10b981"; // Green
                secondaryColor = "#34d399";
            }
            else if (activeFarm.crop_type === "Vegetables") {
                iconClass = "fa-carrot";
                primaryColor = "#059669"; // Dark Green
                secondaryColor = "#10b981";
            }
            else if (activeFarm.crop_type === "Wheat" || activeFarm.crop_type === "Mustard") {
                primaryColor = "#f97316"; // Orange
                secondaryColor = "#fb923c";
            }
            
            iconDisplay.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
            
            // Set dynamic theme colors
            root.style.setProperty('--purple-primary', primaryColor);
            root.style.setProperty('--neon-purple', secondaryColor);
        }
        
        // Update Gauge Target
        const targetVal = document.getElementById("gauge-target-val");
        if (targetVal) targetVal.textContent = `${activeFarm.moisture_threshold}%`;
        
        const targetMarker = document.getElementById("gauge-target-marker");
        if (targetMarker) targetMarker.style.left = `${activeFarm.moisture_threshold}%`;
    }
}

async function refreshTelemetry() {
    if (!appState.activeFarmId) return;
    
    try {
        // 1. Fetch sensor history
        const sensResponse = await fetch(`${API_BASE}/api/sensor-data?farm_id=${appState.activeFarmId}&limit=12`, {
            method: "GET",
            headers: getAuthHeaders()
        });
        const sensData = await sensResponse.json();
        appState.telemetryHistory = sensData;
        
        // Update Chart
        renderLiveSVGChart();
        
        // Update KPI values with latest reading
        if (sensData.length > 0) {
            const latest = sensData[sensData.length - 1];
            document.getElementById("kpi-temp").textContent = `${latest.temperature}°C`;
            document.getElementById("kpi-humidity").textContent = `${latest.humidity}%`;
            document.getElementById("kpi-rain").textContent = `${latest.rainfall} mm`;
            document.getElementById("kpi-moisture").textContent = `${latest.soil_moisture}%`;
            
            // Update Crop Health Gauge
            const gaugeVal = document.getElementById("gauge-moisture-val");
            const gaugeFill = document.getElementById("gauge-fill");
            if (gaugeVal && gaugeFill) {
                gaugeVal.textContent = `${latest.soil_moisture}%`;
                gaugeFill.style.width = `${Math.min(100, latest.soil_moisture)}%`;
            }
        } else {
            document.getElementById("kpi-temp").textContent = "--°C";
            document.getElementById("kpi-humidity").textContent = "--%";
            document.getElementById("kpi-rain").textContent = "-- mm";
            document.getElementById("kpi-moisture").textContent = "--%";
            
            const gaugeVal = document.getElementById("gauge-moisture-val");
            const gaugeFill = document.getElementById("gauge-fill");
            if (gaugeVal && gaugeFill) {
                gaugeVal.textContent = "--%";
                gaugeFill.style.width = `0%`;
            }
        }
        
        // 2. Fetch Decisions history
        const decResponse = await fetch(`${API_BASE}/api/irrigation-logs?farm_id=${appState.activeFarmId}&limit=5`, {
            method: "GET",
            headers: getAuthHeaders()
        });
        const decData = await decResponse.json();
        renderTimeline(decData);
        
        // 3. Fetch Alerts feed
        const alertResponse = await fetch(`${API_BASE}/api/alerts`, {
            method: "GET",
            headers: getAuthHeaders()
        });
        const alertData = await alertResponse.json();
        renderAlerts(alertData);
        
    } catch (err) {
        console.error("Telemetry refresh error:", err);
    }
}

// ==========================================================
// 4. TELEMETRY DATA SIMULATION
// ==========================================================
async function triggerSimulationStep() {
    const simulateBtn = document.getElementById("simulate-step-btn");
    simulateBtn.disabled = true;
    simulateBtn.classList.add("loading");
    simulateBtn.querySelector("span").textContent = "Ingesting Data...";
    
    try {
        const response = await fetch(`${API_BASE}/api/sensors/simulate`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                farm_id: appState.activeFarmId,
                regressor_model: appState.activeRegressor,
                classifier_model: appState.activeClassifier
            })
        });
        
        if (response.ok) {
            // Success! Refresh
            await refreshTelemetry();
        } else {
            const err = await response.json();
            alert(`Simulation failed: ${err.message}`);
        }
    } catch (e) {
        console.error("Sim error:", e);
    } finally {
        simulateBtn.disabled = false;
        simulateBtn.classList.remove("loading");
        simulateBtn.querySelector("span").textContent = "Simulate Next Reading";
    }
}

async function triggerModelRetraining() {
    const retrainBtn = document.getElementById("retrain-btn");
    retrainBtn.disabled = true;
    retrainBtn.querySelector("span").textContent = "Retraining...";
    
    try {
        const response = await fetch(`${API_BASE}/api/models/train`, {
            method: "POST",
            headers: getAuthHeaders()
        });
        const data = await response.json();
        alert(data.message);
    } catch (e) {
        console.error("Retrain error:", e);
    } finally {
        retrainBtn.disabled = false;
        retrainBtn.querySelector("span").textContent = "Retrain Models";
    }
}

// ==========================================================
// 5. RENDER CHANNELS (CHART, TIMELINE, ALERTS)
// ==========================================================

function renderLiveSVGChart() {
    const data = appState.telemetryHistory;
    const chartSvg = document.getElementById("live-chart");
    const emptyMsg = document.getElementById("chart-empty");
    
    const linePath = document.getElementById("chart-line-path");
    const areaPath = document.getElementById("chart-area-path");
    const gridLines = document.getElementById("chart-grid-lines");
    const dotsGroup = document.getElementById("chart-dots");
    
    // Clear dynamic elements
    gridLines.innerHTML = "";
    dotsGroup.innerHTML = "";
    
    if (!data || data.length === 0) {
        linePath.setAttribute("d", "");
        areaPath.setAttribute("d", "");
        emptyMsg.classList.remove("hidden");
        return;
    }
    
    emptyMsg.classList.add("hidden");
    
    // SVG Dimension: viewBox="0 0 600 240"
    const width = 600;
    const height = 240;
    const paddingX = 40;
    const paddingY = 30;
    
    const usableW = width - (paddingX * 2);
    const usableH = height - (paddingY * 2);
    
    // Draw 4 vertical background grid lines
    for (let i = 0; i <= 4; i++) {
        const gx = paddingX + (usableW * i / 4);
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", gx);
        l.setAttribute("y1", paddingY);
        l.setAttribute("x2", gx);
        l.setAttribute("y2", height - paddingY);
        l.setAttribute("class", "chart-grid-line");
        gridLines.appendChild(l);
    }
    
    // Draw 3 horizontal grid lines (for moisture levels: 25%, 50%, 75%)
    for (let i = 1; i <= 3; i++) {
        const gy = paddingY + (usableH * i / 4);
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", paddingX);
        l.setAttribute("y1", gy);
        l.setAttribute("x2", width - paddingX);
        l.setAttribute("y2", gy);
        l.setAttribute("class", "chart-grid-line");
        gridLines.appendChild(l);
    }
    
    // Plot points
    // Map array index to X (paddingX ... width-paddingX)
    // Map moisture (0 ... 100) to Y (height-paddingY ... paddingY)
    const points = data.map((d, idx) => {
        const x = paddingX + (usableW * idx / (Math.max(data.length - 1, 1)));
        const y = (height - paddingY) - (usableH * d.soil_moisture / 100);
        return { x, y, val: d.soil_moisture, source: d.source, time: d.timestamp.split(" ")[1] };
    });
    
    // Construct Path string
    let pathD = "";
    points.forEach((p, idx) => {
        if (idx === 0) {
            pathD += `M ${p.x} ${p.y}`;
        } else {
            pathD += ` L ${p.x} ${p.y}`;
        }
        
        // Add nodes
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.x);
        circle.setAttribute("cy", p.y);
        circle.setAttribute("r", 4.5);
        circle.setAttribute("class", "chart-node");
        circle.setAttribute("title", `${p.val}% at ${p.time}`);
        
        // Change color slightly if physical source
        if (p.source === "physical") {
            circle.style.stroke = "#10b981"; // green accent for physical sensor
        }
        
        dotsGroup.appendChild(circle);
    });
    
    linePath.setAttribute("d", pathD);
    
    // Construct Filled Area Path String
    if (points.length > 0) {
        const first = points[0];
        const last = points[points.length - 1];
        const areaD = `${pathD} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;
        areaPath.setAttribute("d", areaD);
    }
}

function renderTimeline(logs) {
    const container = document.getElementById("timeline-container");
    container.innerHTML = "";
    
    if (!logs || logs.length === 0) {
        container.innerHTML = '<div class="timeline-empty"><p>No activity logs. Ingest telemetry data to start.</p></div>';
        return;
    }
    
    logs.forEach(log => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        
        const isIrrigating = log.decision === "irrigate";
        const dotClass = isIrrigating ? "irrigate" : "skip";
        const actionLabel = isIrrigating ? "IRRIGATE ENGAGED" : "IRRIGATION SKIPPED";
        
        // Time formatting
        const t = log.timestamp.split(" ")[1];
        
        item.innerHTML = `
            <div class="timeline-dot ${dotClass}"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <span class="timeline-title" style="color: ${isIrrigating ? '#bd52fc' : '#3b82f6'}">${actionLabel}</span>
                    <span class="timeline-time">${t}</span>
                </div>
                <p class="timeline-desc">Soil moisture predicted at <strong>${log.predicted_moisture}%</strong>. Classifier model ordered active bypass.</p>
                <div class="timeline-meta">
                    <span>Model: <strong>${log.model_used}</strong></span>
                    <span>Confidence: <strong>${(log.confidence * 100).toFixed(1)}%</strong></span>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderAlerts(alerts) {
    const container = document.getElementById("alerts-list-container");
    container.innerHTML = "";
    
    // Filter alerts for current active farm
    const activeAlerts = alerts.filter(a => a.farm_id === appState.activeFarmId);
    
    // Update profile counter
    document.getElementById("stat-active-alerts").textContent = activeAlerts.length;
    
    if (activeAlerts.length === 0) {
        container.innerHTML = `
            <div class="empty-alerts">
                <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                <p>All safety boundaries normal. No active warnings.</p>
            </div>
        `;
        return;
    }
    
    activeAlerts.forEach(alert => {
        const card = document.createElement("div");
        const isAnomaly = alert.alert_type.includes("Anomaly");
        card.className = `alert-card ${isAnomaly ? 'warning' : ''}`;
        
        card.innerHTML = `
            <h5>${alert.alert_type}</h5>
            <p>${alert.message}</p>
            <div class="alert-card-footer">
                <span class="alert-time">${alert.timestamp}</span>
                <button class="resolve-btn" onclick="resolveAlert('${alert.alert_id}')">Resolve</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Triggered inline from alert card button
window.resolveAlert = async function(alertId) {
    try {
        const response = await fetch(`${API_BASE}/api/alerts`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ alert_id: alertId })
        });
        
        if (response.ok) {
            refreshTelemetry();
        }
    } catch (e) {
        console.error("Resolve alert error:", e);
    }
};

// ==========================================================
// 6. MODELS PERFORMANCE AND COMPARISON DIALOG
// ==========================================================
async function loadModelPerformanceMetrics() {
    const regBody = document.getElementById("regression-metrics-body");
    const clfBody = document.getElementById("classification-metrics-body");
    
    regBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading statistics...</td></tr>';
    clfBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading statistics...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE}/api/models/status`, {
            method: "GET",
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (!data.trained) {
            regBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No models trained yet. Click "Retrain Models" first.</td></tr>';
            clfBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No models trained yet. Click "Retrain Models" first.</td></tr>';
            return;
        }
        
        // Pop regression table
        regBody.innerHTML = "";
        Object.entries(data.regression).forEach(([name, vals]) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${name}</strong></td>
                <td>${vals.rmse.toFixed(4)}</td>
                <td>${vals.r2.toFixed(4)}</td>
                <td><span class="status-badge">Active</span></td>
            `;
            regBody.appendChild(tr);
        });
        
        // Pop classification table
        clfBody.innerHTML = "";
        Object.entries(data.classification).forEach(([name, vals]) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${name}</strong></td>
                <td>${(vals.accuracy * 100).toFixed(2)}%</td>
                <td>${(vals.precision * 100).toFixed(2)}%</td>
                <td>${(vals.recall * 100).toFixed(2)}%</td>
                <td>${(vals.f1_score * 100).toFixed(2)}%</td>
                <td><span class="status-badge">Active</span></td>
            `;
            clfBody.appendChild(tr);
        });
        
    } catch (err) {
        console.error("Metrics load failure:", err);
    }
}

// ==========================================================
// PAGE-SPECIFIC LOADERS (called by navigateTo)
// ==========================================================

async function loadModelPageData() {
    // Load metrics into the models page tables if elements exist
    const regBody = document.getElementById("regression-metrics-body");
    const clfBody = document.getElementById("classification-metrics-body");
    if (!regBody || !clfBody) return;

    regBody.innerHTML = '<tr><td colspan="4" class="table-loading"><div class="shimmer-line"></div></td></tr>';
    clfBody.innerHTML = '<tr><td colspan="6" class="table-loading"><div class="shimmer-line"></div></td></tr>';

    try {
        const response = await fetch(`${API_BASE}/api/models/status`, { headers: getAuthHeaders() });
        const data = await response.json();

        if (!data.trained) {
            regBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No trained models found. Click Retrain.</td></tr>';
            clfBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">No trained models found. Click Retrain.</td></tr>';
            return;
        }

        // Fill regression table
        regBody.innerHTML = "";
        const regEntries = Object.entries(data.regression || {});
        regEntries.forEach(([name, vals], idx) => {
            const tr = document.createElement("tr");
            const rankClass = idx === 0 ? "rank-1" : idx === 1 ? "rank-2" : idx === 2 ? "rank-3" : "rank-other";
            tr.innerHTML = `
                <td><span class="rank-badge ${rankClass}">${idx + 1}</span></td>
                <td><strong>${name}</strong></td>
                <td>${vals.rmse !== undefined ? vals.rmse.toFixed(4) : "—"}</td>
                <td>${vals.r2 !== undefined ? vals.r2.toFixed(4) : "—"}</td>
                <td><span class="status-badge">Active</span></td>
            `;
            regBody.appendChild(tr);
        });

        // Fill classification table
        clfBody.innerHTML = "";
        const clfEntries = Object.entries(data.classification || {});
        clfEntries.forEach(([name, vals], idx) => {
            const tr = document.createElement("tr");
            const rankClass = idx === 0 ? "rank-1" : idx === 1 ? "rank-2" : idx === 2 ? "rank-3" : "rank-other";
            tr.innerHTML = `
                <td><span class="rank-badge ${rankClass}">${idx + 1}</span></td>
                <td><strong>${name}</strong></td>
                <td>${vals.accuracy !== undefined ? (vals.accuracy * 100).toFixed(2) + "%" : "—"}</td>
                <td>${vals.precision !== undefined ? (vals.precision * 100).toFixed(2) + "%" : "—"}</td>
                <td>${vals.recall !== undefined ? (vals.recall * 100).toFixed(2) + "%" : "—"}</td>
                <td>${vals.f1_score !== undefined ? (vals.f1_score * 100).toFixed(2) + "%" : "—"}</td>
                <td><span class="status-badge">Active</span></td>
            `;
            clfBody.appendChild(tr);
        });

        // Render bar charts if containers exist
        renderModelBarCharts(data);

    } catch (err) {
        console.error("Model page load error:", err);
    }
}

function renderModelBarCharts(data) {
    const colors = ["purple", "blue", "green", "orange", "teal", "pink", "red"];
    const regChart = document.getElementById("reg-bar-chart");
    const clfChart = document.getElementById("clf-bar-chart");

    if (regChart && data.regression) {
        const entries = Object.entries(data.regression);
        const maxRmse = Math.max(...entries.map(([, v]) => v.rmse || 0));
        regChart.innerHTML = "";
        entries.forEach(([name, vals], i) => {
            const pct = maxRmse > 0 ? ((vals.rmse / maxRmse) * 100).toFixed(1) : 0;
            regChart.innerHTML += `
                <div class="bar-item">
                    <span class="bar-label" title="${name}">${name}</span>
                    <div class="bar-track">
                        <div class="bar-fill ${colors[i % colors.length]}" style="width:${pct}%">
                            ${vals.rmse !== undefined ? vals.rmse.toFixed(3) : ""}
                        </div>
                    </div>
                    <span class="bar-value">R²: ${vals.r2 !== undefined ? vals.r2.toFixed(3) : "—"}</span>
                </div>`;
        });
    }

    if (clfChart && data.classification) {
        const entries = Object.entries(data.classification);
        clfChart.innerHTML = "";
        entries.forEach(([name, vals], i) => {
            const pct = vals.accuracy !== undefined ? (vals.accuracy * 100).toFixed(1) : 0;
            clfChart.innerHTML += `
                <div class="bar-item">
                    <span class="bar-label" title="${name}">${name}</span>
                    <div class="bar-track">
                        <div class="bar-fill ${colors[i % colors.length]}" style="width:${pct}%">
                            ${pct}%
                        </div>
                    </div>
                    <span class="bar-value">F1: ${vals.f1_score !== undefined ? (vals.f1_score * 100).toFixed(1) + "%" : "—"}</span>
                </div>`;
        });
    }
}

async function loadSensorLogs() {
    if (!appState.activeFarmId) return;
    const tbody = document.getElementById("sensor-log-body");
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="table-loading"><div class="shimmer-line"></div></td></tr>';

    try {
        const res = await fetch(`${API_BASE}/api/sensor-data?farm_id=${appState.activeFarmId}&limit=20`, {
            headers: getAuthHeaders()
        });
        const rows = await res.json();
        tbody.innerHTML = "";
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">No sensor data recorded yet. Run a simulation first.</td></tr>';
            return;
        }
        rows.reverse().forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.timestamp || "—"}</td>
                <td>${row.temperature !== undefined ? row.temperature.toFixed(1) + " °C" : "—"}</td>
                <td>${row.humidity !== undefined ? row.humidity.toFixed(1) + "%" : "—"}</td>
                <td>${row.rainfall !== undefined ? row.rainfall.toFixed(1) + " mm" : "—"}</td>
                <td>${row.soil_moisture !== undefined ? row.soil_moisture.toFixed(1) + "%" : "—"}</td>
                <td>${row.predicted_moisture !== undefined ? row.predicted_moisture.toFixed(1) + "%" : "—"}</td>
                <td><span class="source-badge ${row.source || 'simulated'}">${row.source || "simulated"}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Sensor log load error:", err);
    }
}
