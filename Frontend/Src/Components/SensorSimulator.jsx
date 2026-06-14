import React from "react";
import { CardTitle, IconSettings } from "./Icons.jsx";

export default function SensorSimulator({ systemState, onStateChange }) {
  const triggerSensor = async (sensorId, value) => {
    try {
      await onStateChange("sensor", { sensorId, value });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTimeChange = (e) => {
    onStateChange("settings", { simulatedTime: e.target.value });
  };

  const handleDateChange = (e) => {
    onStateChange("settings", { simulatedDate: e.target.value });
  };

  const handlePowerChange = (e) => {
    onStateChange("settings", { powerStatus: e.target.value });
  };

  const handleWhistlesChange = (e) => {
    onStateChange("settings", { targetWhistles: parseInt(e.target.value, 10) });
  };

  const timePresets = [
    { label: "06:05 AM (Morning wake)", val: "06:05:00" },
    { label: "06:30 AM (Pooja time)", val: "06:30:00" },
    { label: "07:15 AM (Water/Cooker)", val: "07:15:00" },
    { label: "06:15 PM (Power cuts/Tuition)", val: "18:15:00" },
    { label: "10:30 PM (Sleep time)", val: "22:30:00" }
  ];

  return (
    <div className="glassCard" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <CardTitle
        icon={IconSettings}
        iconColor="var(--colorAmber)"
        title="Sensor Simulator"
        badge={<span className="glowingDot" style={{ width: "6px", height: "6px" }}></span>}
      />

      {/* Simulated Time & Date Settings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--textSecondary)", marginBottom: "4px" }}>
            Simulated Clock Time
          </label>
          <input
            type="time"
            step="1"
            value={systemState.simulatedTime || "06:00:00"}
            onChange={handleTimeChange}
            style={{
              width: "100%",
              padding: "10px",
              background: "#1c202e",
              border: "1px solid var(--borderCard)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--textSecondary)", marginBottom: "4px" }}>
            Simulated Calendar Date
          </label>
          <select
            value={systemState.simulatedDate || "06-13"}
            onChange={handleDateChange}
            style={{
              width: "100%",
              padding: "10px",
              background: "#1c202e",
              border: "1px solid var(--borderCard)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px"
            }}
          >
            <option value="06-13">Normal Day (13th June)</option>
            <option value="10-12">Navratri Start (Fasting Day)</option>
            <option value="11-08">Diwali (Pooja Mode Day)</option>
            <option value="06-14">Monthly Ekadashi (Fasting Day)</option>
            <option value="03-06">Maha Shivratri (Fasting Day)</option>
          </select>
        </div>
      </div>

      {/* Time Presets Row */}
      <div>
        <span style={{ fontSize: "12px", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>
          Quick Time Warp Presets:
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {timePresets.map((preset) => (
            <button
              key={preset.val}
              onClick={() => onStateChange("settings", { simulatedTime: preset.val })}
              className="btn"
              style={{
                fontSize: "12px",
                padding: "4px 8px",
                background: systemState.simulatedTime === preset.val ? "rgba(255, 126, 64, 0.15)" : "",
                borderColor: systemState.simulatedTime === preset.val ? "var(--colorOrange)" : ""
              }}
            >
              🕒 {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Power status and cooker configurations */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--textSecondary)", marginBottom: "4px" }}>
            Power Grid Status
          </label>
          <select
            value={systemState.powerStatus || "GRID"}
            onChange={handlePowerChange}
            style={{
              width: "100%",
              padding: "10px",
              background: "#1c202e",
              border: "1px solid var(--borderCard)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px"
            }}
          >
            <option value="GRID">🔌 Grid Supply Stable</option>
            <option value="INVERTER">🔋 Power Cut (Inverter Backup)</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--textSecondary)", marginBottom: "4px" }}>
            Cooker Whistle Target
          </label>
          <select
            value={systemState.targetWhistles || 3}
            onChange={handleWhistlesChange}
            style={{
              width: "100%",
              padding: "10px",
              background: "#1c202e",
              border: "1px solid var(--borderCard)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px"
            }}
          >
            <option value={2}>2 Whistles (e.g. Rice)</option>
            <option value={3}>3 Whistles (e.g. Dal)</option>
            <option value={5}>5 Whistles (e.g. Chana)</option>
          </select>
        </div>
      </div>

      {/* Sensor Event Triggers */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "white", display: "block", marginBottom: "12px" }}>
          Simulated IoT Sensor Events (Click to Fire):
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <button onClick={() => triggerSensor("toiletFlush", "active")} className="btn">
            🚽 Toilet Flush Event
          </button>
          <button onClick={() => triggerSensor("bathroomMotion", "active")} className="btn">
            🚶 Bathroom Motion
          </button>
          <button onClick={() => triggerSensor("poojaRoomMotion", "active")} className="btn">
            🪔 Pooja Room Motion
          </button>
          <button onClick={() => triggerSensor("cookerWhistle", "active")} className="btn" style={{ position: "relative" }}>
            💨 Cooker Whistle {systemState.whistleCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                background: "var(--colorOrange)",
                color: "black",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                fontSize: "11px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {systemState.whistleCount}
              </span>
            )}
          </button>
          <button onClick={() => triggerSensor("waterLevelLow", "active")} className="btn">
            🚰 Water Level Low
          </button>
          <button onClick={() => triggerSensor("waterMotorRunningLong", "active")} className="btn" style={{ color: "var(--colorDanger)", borderColor: "rgba(236,112,99,0.3)" }}>
            ⚠️ Motor Leak Risk Event
          </button>
          <button onClick={() => triggerSensor("powerCutRiskHigh", "active")} className="btn">
            ⚡ loadShedding Predicted (85%)
          </button>
          <button onClick={() => triggerSensor("childrenStudyMotion", "active")} className="btn">
            📚 Study Room Motion
          </button>
          <button onClick={() => triggerSensor("bedroomMotion", "active")} className="btn">
            🛏️ Bedroom Motion
          </button>
          <button onClick={() => triggerSensor("lateNightQuiet", "active")} className="btn">
            🌙 Wind Down Silent Trigger
          </button>
        </div>
      </div>
    </div>
  );
}
