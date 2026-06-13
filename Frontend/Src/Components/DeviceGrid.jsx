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

export default function DeviceGrid({ devices, onToggleDevice }) {
  const getDeviceClass = (key, status) => {
    if (status === "OFF") return "deviceItem";
    if (status === "DO_NOT_DISTURB" || status === "MEDITATION_DIMS" || status === "STUDY_FOCUS_BRIGHTNESS") {
      return "deviceItem deviceActive deviceSpecialActive";
    }
    return "deviceItem deviceActive";
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ");
  };

  return (
    <div className="glassCard">
      <div className="cardHeader" style={{ marginBottom: "16px" }}>
        <h2>🔌 Connected Smart Appliances</h2>
        <span style={{ fontSize: "12px", color: "var(--textSecondary)" }}>{Object.keys(devices).length} Devices Active</span>
      </div>

      <div className="deviceGrid">
        {Object.entries(devices).map(([key, dev]) => {
          const isSpecial = dev.status !== "ON" && dev.status !== "OFF";
          return (
            <div
              key={key}
              className={getDeviceClass(key, dev.status)}
              onClick={() => onToggleDevice(key, dev.status === "OFF" ? "ON" : "OFF")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="deviceIcon">{deviceIcons[key] || "🔌"}</span>
                {dev.status !== "OFF" && (
                  <span
                    className={isSpecial ? "glowingDot" : "glowingDot"}
                    style={{ background: isSpecial ? "#a855f7" : "var(--colorOrange)", boxShadow: isSpecial ? "0 0 8px #a855f7" : "0 0 8px var(--colorOrange)" }}
                  ></span>
                )}
              </div>
              <div>
                <div className="deviceName">{dev.name}</div>
                <div className="deviceStatus" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                  {formatStatus(dev.status)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--textMuted)", display: "flex", gap: "10px", justifyContent: "center" }}>
        <span>🔸 Orange = Normal ON</span>
        <span>🔹 Purple = Culturally Customized Mode</span>
      </div>
    </div>
  );
}
