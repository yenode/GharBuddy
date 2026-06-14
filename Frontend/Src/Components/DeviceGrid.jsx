import React from "react";
import { CardTitle, IconCpu } from "./Icons.jsx";

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
    if (status === "NORMAL_CHARGE") return "Charging";
    if (status === "FAST_CHARGE") return "Fast Charge";
    if (status === "MEDITATION_DIMS") return "Dim · Pooja";
    if (status === "STUDY_FOCUS_BRIGHTNESS") return "Focus Mode";
    if (status === "DO_NOT_DISTURB") return "Do Not Disturb";
    return status.replace(/_/g, " ");
  };

  const activeCount = Object.values(devices).filter(d => d.status !== "OFF" && d.status !== "STANDBY").length;

  return (
    <div className="glassCard">
      <CardTitle
        icon={IconCpu}
        iconColor="var(--colorOrange)"
        title="Smart Appliances"
        badge={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--textMuted)" }}>
              {activeCount}/{Object.keys(devices).length} active
            </span>
            {activeCount > 0 && <span className="glowingDot" style={{ width: "6px", height: "6px" }}></span>}
          </div>
        }
      />

      <div className="deviceGrid">
        {Object.entries(devices).map(([key, dev]) => {
          const isSpecial = dev.status !== "ON" && dev.status !== "OFF" && dev.status !== "NORMAL";
          return (
            <div
              key={key}
              className={getDeviceClass(key, dev.status)}
              onClick={() => onToggleDevice(key, dev.status === "OFF" ? "ON" : "OFF")}
              title={`${dev.name} — ${dev.status}`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="deviceIcon">{deviceIcons[key] || "🔌"}</span>
                {dev.status !== "OFF" && dev.status !== "STANDBY" && (
                  <span
                    className="glowingDot"
                    style={{
                      width: "6px", height: "6px",
                      background: isSpecial ? "#a78bfa" : "var(--colorOrange)",
                      boxShadow: `0 0 6px ${isSpecial ? "#a78bfa" : "var(--colorOrange)"}`,
                    }}
                  />
                )}
              </div>
              <div>
                <div className="deviceName">{dev.name}</div>
                <div className="deviceStatus">{formatStatus(dev.status)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "12px", display: "flex", gap: "14px", justifyContent: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--textMuted)" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--colorOrange)", display: "inline-block" }}></span>
          Active
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--textMuted)" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", display: "inline-block" }}></span>
          Cultural mode
        </span>
      </div>
    </div>
  );
}
