import React from "react";

const deviceIcons = {
  geyser: "🚿",
  poojaLights: "🪔",
  waterMotor: "⛲",
  inverterBackup: "🔋",
  livingRoomLights: "💡",
  television: "📺",
  airConditioner: "❄️",
  speakerSystem: "🔊"
};

export default function HouseholdMap({ devices, onToggleDevice }) {
  const getPowerUsed = (key, status) => {
    if (status === "OFF" || status === "STANDBY" && key === "airConditioner") return 0;
    const device = devices[key];
    if (!device) return 0;
    
    // Custom power draw based on cultural/study mode dims
    if (status === "MEDITATION_DIMS") return 15;
    if (status === "STUDY_FOCUS_BRIGHTNESS") return 45;
    if (status === "DO_NOT_DISTURB") return 5;
    return device.wattage || 0;
  };

  const isDeviceOn = (status) => {
    return status !== "OFF" && status !== "STANDBY";
  };

  // Calculate live load
  const totalLoad = Object.keys(devices).reduce(
    (sum, key) => sum + getPowerUsed(key, devices[key].status),
    0
  );

  // Status check for room lighting glows
  const isLivingRoomGlowing = isDeviceOn(devices.television?.status) || isDeviceOn(devices.livingRoomLights?.status);
  const isBedroomGlowing = isDeviceOn(devices.airConditioner?.status);
  const isBathroomGlowing = isDeviceOn(devices.geyser?.status);
  const isPoojaGlowing = isDeviceOn(devices.poojaLights?.status);
  const isUtilityGlowing = isDeviceOn(devices.waterMotor?.status) || devices.inverterBackup?.status === "FAST_CHARGE";

  const handleDeviceClick = (key) => {
    const currentStatus = devices[key]?.status || "OFF";
    const nextStatus = currentStatus === "OFF" ? "ON" : "OFF";
    onToggleDevice(key, nextStatus);
  };

  return (
    <div className="glassCard" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="cardHeader" style={{ marginBottom: "8px" }}>
        <div>
          <h2>🗺️ 2D Interactive Household Map</h2>
          <p style={{ fontSize: "11px", color: "var(--textSecondary)", marginTop: "2px" }}>
            Click appliances directly on the Among Us-style floor plan to control them.
          </p>
        </div>
        
        {/* Live Power Monitor */}
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "11px", color: "var(--textMuted)", textTransform: "uppercase", fontWeight: "700" }}>
            Total Home Load
          </span>
          <div style={{ fontSize: "20px", fontWeight: "800", color: totalLoad > 1000 ? "var(--colorWarning)" : "var(--colorSuccess)" }}>
            ⚡ {totalLoad} W
          </div>
        </div>
      </div>

      {/* Interactive SVG Floor Plan */}
      <div style={{ 
        background: "#0c0d12", 
        borderRadius: "12px", 
        border: "1px solid rgba(255, 255, 255, 0.05)",
        overflow: "hidden",
        position: "relative"
      }}>
        <svg viewBox="0 0 600 360" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            {/* Soft Glow Filters */}
            <radialGradient id="livingGlow" cx="25%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#3498db" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0c0d12" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bedroomGlow" cx="75%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#26c281" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0c0d12" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bathroomGlow" cx="20%" cy="80%" r="70%">
              <stop offset="0%" stopColor="#ff7e40" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0c0d12" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="poojaGlow" cx="50%" cy="80%" r="70%">
              <stop offset="0%" stopColor="#ffc837" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0c0d12" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="utilityGlow" cx="80%" cy="80%" r="70%">
              <stop offset="0%" stopColor="#9b59b6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0c0d12" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* BACKGROUND GLOWS (React to device states) */}
          {isLivingRoomGlowing && <rect x="15" y="15" width="270" height="170" fill="url(#livingGlow)" transition="all 0.5s ease" />}
          {isBedroomGlowing && <rect x="300" y="15" width="285" height="150" fill="url(#bedroomGlow)" transition="all 0.5s ease" />}
          {isBathroomGlowing && <rect x="15" y="200" width="165" height="145" fill="url(#bathroomGlow)" transition="all 0.5s ease" />}
          {isPoojaGlowing && <rect x="195" y="200" width="165" height="145" fill="url(#poojaGlow)" transition="all 0.5s ease" />}
          {isUtilityGlowing && <rect x="375" y="180" width="210" height="165" fill="url(#utilityGlow)" transition="all 0.5s ease" />}

          {/* ROOM WALL BORDERS */}
          {/* Living Room */}
          <rect x="15" y="15" width="270" height="170" fill="none" stroke={isLivingRoomGlowing ? "rgba(52, 152, 219, 0.4)" : "rgba(255,255,255,0.06)"} strokeWidth="2" rx="6" />
          {/* Bedroom */}
          <rect x="300" y="15" width="285" height="150" fill="none" stroke={isBedroomGlowing ? "rgba(38, 194, 129, 0.4)" : "rgba(255,255,255,0.06)"} strokeWidth="2" rx="6" />
          {/* Bathroom */}
          <rect x="15" y="200" width="165" height="145" fill="none" stroke={isBathroomGlowing ? "rgba(255, 126, 64, 0.5)" : "rgba(255,255,255,0.06)"} strokeWidth="2" rx="6" />
          {/* Pooja Room */}
          <rect x="195" y="200" width="165" height="145" fill="none" stroke={isPoojaGlowing ? "rgba(255, 200, 55, 0.5)" : "rgba(255,255,255,0.06)"} strokeWidth="2" rx="6" />
          {/* Utility Balcony */}
          <rect x="375" y="180" width="210" height="165" fill="none" stroke={isUtilityGlowing ? "rgba(155, 89, 182, 0.4)" : "rgba(255,255,255,0.06)"} strokeWidth="2" rx="6" />

          {/* ROOM LABELS */}
          <text x="35" y="40" fill="var(--textSecondary)" fontSize="11" fontWeight="700" letterSpacing="0.5">LIVING ROOM</text>
          <text x="320" y="40" fill="var(--textSecondary)" fontSize="11" fontWeight="700" letterSpacing="0.5">BEDROOM</text>
          <text x="35" y="225" fill="var(--textSecondary)" fontSize="11" fontWeight="700" letterSpacing="0.5">BATHROOM</text>
          <text x="215" y="225" fill="var(--textSecondary)" fontSize="11" fontWeight="700" letterSpacing="0.5">POOJA ROOM 🪔</text>
          <text x="395" y="205" fill="var(--textSecondary)" fontSize="11" fontWeight="700" letterSpacing="0.5">UTILITY AREA</text>

          {/* CONNECTOR DOORWAYS (Visual lines) */}
          <line x1="285" y1="90" x2="300" y2="90" stroke="#0c0d12" strokeWidth="6" /> {/* Hall to Bed */}
          <line x1="100" y1="185" x2="100" y2="200" stroke="#0c0d12" strokeWidth="6" /> {/* Hall to Bath */}
          <line x1="280" y1="230" x2="280" y2="250" stroke="#0c0d12" strokeWidth="4" />
          
          {/* INTERACTIVE APPLIANCE NODES */}
          {/* 1. TV (Living Room) */}
          <g transform="translate(60, 75)" cursor="pointer" onClick={() => handleDeviceClick("television")}>
            <rect x="0" y="0" width="80" height="40" rx="6" fill={isDeviceOn(devices.television?.status) ? "rgba(52,152,219,0.15)" : "rgba(255,255,255,0.02)"} stroke={isDeviceOn(devices.television?.status) ? "#3498db" : "rgba(255,255,255,0.1)"} strokeWidth="1" />
            <text x="8" y="24" fontSize="16">{deviceIcons.television}</text>
            <text x="32" y="18" fill="white" fontSize="10" fontWeight="600">Smart TV</text>
            <text x="32" y="30" fill="var(--textSecondary)" fontSize="8">{getPowerUsed("television", devices.television?.status)}W | {devices.television?.status || "OFF"}</text>
          </g>

          {/* 2. Living Lights (Living Room) */}
          <g transform="translate(170, 75)" cursor="pointer" onClick={() => handleDeviceClick("livingRoomLights")}>
            <rect x="0" y="0" width="90" height="40" rx="6" fill={isDeviceOn(devices.livingRoomLights?.status) ? "rgba(52,152,219,0.15)" : "rgba(255,255,255,0.02)"} stroke={isDeviceOn(devices.livingRoomLights?.status) ? "#3498db" : "rgba(255,255,255,0.1)"} strokeWidth="1" />
            <text x="8" y="24" fontSize="16">{deviceIcons.livingRoomLights}</text>
            <text x="32" y="18" fill="white" fontSize="10" fontWeight="600">LR Lights</text>
            <text x="32" y="30" fill="var(--textSecondary)" fontSize="8">{getPowerUsed("livingRoomLights", devices.livingRoomLights?.status)}W | {devices.livingRoomLights?.status || "OFF"}</text>
          </g>

          {/* 3. Speaker (Living Room) */}
          <g transform="translate(110, 130)" cursor="pointer" onClick={() => handleDeviceClick("speakerSystem")}>
            <circle cx="16" cy="16" r="16" fill={isDeviceOn(devices.speakerSystem?.status) ? "rgba(52,152,219,0.15)" : "rgba(255,255,255,0.02)"} stroke={isDeviceOn(devices.speakerSystem?.status) ? "#3498db" : "rgba(255,255,255,0.1)"} strokeWidth="1" />
            <text x="8" y="22" fontSize="12">{deviceIcons.speakerSystem}</text>
            <text x="38" y="14" fill="white" fontSize="9" fontWeight="600">Alexa Speaker</text>
            <text x="38" y="24" fill="var(--textMuted)" fontSize="8">{getPowerUsed("speakerSystem", devices.speakerSystem?.status)}W | {devices.speakerSystem?.status || "NORMAL"}</text>
          </g>

          {/* 4. AC (Bedroom) */}
          <g transform="translate(390, 70)" cursor="pointer" onClick={() => handleDeviceClick("airConditioner")}>
            <rect x="0" y="0" width="100" height="40" rx="6" fill={isDeviceOn(devices.airConditioner?.status) ? "rgba(38,194,129,0.15)" : "rgba(255,255,255,0.02)"} stroke={isDeviceOn(devices.airConditioner?.status) ? "#26c281" : "rgba(255,255,255,0.1)"} strokeWidth="1" />
            <text x="8" y="26" fontSize="16">{deviceIcons.airConditioner}</text>
            <text x="32" y="18" fill="white" fontSize="10" fontWeight="600">Air Conditioner</text>
            <text x="32" y="30" fill="var(--textSecondary)" fontSize="8">{getPowerUsed("airConditioner", devices.airConditioner?.status)}W | {devices.airConditioner?.status || "OFF"}</text>
          </g>

          {/* 5. Geyser (Bathroom) */}
          <g transform="translate(45, 255)" cursor="pointer" onClick={() => handleDeviceClick("geyser")}>
            <rect x="0" y="0" width="105" height="42" rx="6" fill={isDeviceOn(devices.geyser?.status) ? "rgba(255,126,64,0.15)" : "rgba(255,255,255,0.02)"} stroke={isDeviceOn(devices.geyser?.status) ? "var(--colorOrange)" : "rgba(255,255,255,0.1)"} strokeWidth="1" />
            <text x="8" y="26" fontSize="16">{deviceIcons.geyser}</text>
            <text x="32" y="18" fill="white" fontSize="10" fontWeight="600">Bath Geyser</text>
            <text x="32" y="30" fill="var(--textSecondary)" fontSize="8">{getPowerUsed("geyser", devices.geyser?.status)}W | {devices.geyser?.status || "OFF"}</text>
          </g>

          {/* 6. Pooja Lights (Pooja Room) */}
          <g transform="translate(225, 255)" cursor="pointer" onClick={() => handleDeviceClick("poojaLights")}>
            <rect x="0" y="0" width="105" height="42" rx="6" fill={isDeviceOn(devices.poojaLights?.status) ? "rgba(255,200,55,0.15)" : "rgba(255,255,255,0.02)"} stroke={isDeviceOn(devices.poojaLights?.status) ? "var(--colorYellow)" : "rgba(255,255,255,0.1)"} strokeWidth="1" />
            <text x="8" y="26" fontSize="16">{deviceIcons.poojaLights}</text>
            <text x="32" y="18" fill="white" fontSize="10" fontWeight="600">Pooja Lights</text>
            <text x="32" y="30" fill="var(--textSecondary)" fontSize="8">{getPowerUsed("poojaLights", devices.poojaLights?.status)}W | {devices.poojaLights?.status.replace(/_/g, " ") || "OFF"}</text>
          </g>

          {/* 7. Inverter Charger (Utility Balcony) */}
          <g transform="translate(415, 220)" cursor="pointer" onClick={() => handleDeviceClick("inverterBackup")}>
            <rect x="0" y="0" width="120" height="42" rx="6" fill={devices.inverterBackup?.status !== "OFF" ? "rgba(155,89,182,0.15)" : "rgba(255,255,255,0.02)"} stroke={devices.inverterBackup?.status !== "OFF" ? "#9b59b6" : "rgba(255,255,255,0.1)"} strokeWidth="1" />
            <text x="8" y="26" fontSize="16">{deviceIcons.inverterBackup}</text>
            <text x="32" y="18" fill="white" fontSize="10" fontWeight="600">Inverter backup</text>
            <text x="32" y="30" fill="var(--textSecondary)" fontSize="8">{getPowerUsed("inverterBackup", devices.inverterBackup?.status)}W | {devices.inverterBackup?.status.replace(/_/g, " ") || "OFF"}</text>
          </g>

          {/* 8. Water Motor (Utility Balcony) */}
          <g transform="translate(415, 275)" cursor="pointer" onClick={() => handleDeviceClick("waterMotor")}>
            <rect x="0" y="0" width="120" height="42" rx="6" fill={isDeviceOn(devices.waterMotor?.status) ? "rgba(155,89,182,0.15)" : "rgba(255,255,255,0.02)"} stroke={isDeviceOn(devices.waterMotor?.status) ? "#9b59b6" : "rgba(255,255,255,0.1)"} strokeWidth="1" />
            <text x="8" y="26" fontSize="16">{deviceIcons.waterMotor}</text>
            <text x="32" y="18" fill="white" fontSize="10" fontWeight="600">Water Pump</text>
            <text x="32" y="30" fill="var(--textSecondary)" fontSize="8">{getPowerUsed("waterMotor", devices.waterMotor?.status)}W | {devices.waterMotor?.status || "OFF"}</text>
          </g>

        </svg>
      </div>

      {/* Map Legend */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", fontSize: "11px", color: "var(--textMuted)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3498db" }}></span>
          <span>Living Room Glow</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#26c281" }}></span>
          <span>Bedroom Glow</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--colorOrange)" }}></span>
          <span>Bathroom Glow</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--colorYellow)" }}></span>
          <span>Pooja Gold Glow</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#9b59b6" }}></span>
          <span>Utility Glow</span>
        </div>
      </div>
    </div>
  );
}
