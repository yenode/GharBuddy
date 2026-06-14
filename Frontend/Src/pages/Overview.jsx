import React from "react";
import { useData } from "../context/DataContext.jsx";
import HouseholdMap from "../Components/HouseholdMap.jsx";
import ReasoningPanel from "../Components/ReasoningPanel.jsx";
import { IconZap, IconLeaf, IconCpu, IconShield } from "../Components/Icons.jsx";

function StatCard({ icon: Icon, value, label, color, glow }) {
  return (
    <div className="statCard">
      <div className="statGlow" style={{ background: glow }} />
      <div className="statIcon" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`, color }}>
        <Icon width="20" height="20" />
      </div>
      <div className="statValue" style={{ color }}>{value}</div>
      <div className="statLabel">{label}</div>
    </div>
  );
}

export default function Overview() {
  const { devices, energyStats, systemState, lastTriggerResult, handleToggleDevice } = useData();
  const activeCount = Object.values(devices).filter((d) => d.status !== "OFF" && d.status !== "STANDBY").length;
  const totalCount = Object.keys(devices).length;
  const kwh = (energyStats.totalSavedWh / 1000).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="statGrid stagger">
        <StatCard icon={IconLeaf} value={`${kwh} kWh`} label="Energy saved this cycle" color="var(--colorSuccess)" glow="var(--colorSuccess)" />
        <StatCard icon={IconZap} value={`₹ ${energyStats.rupeesSaved}`} label="Money saved" color="var(--accent)" glow="var(--accentGlow)" />
        <StatCard icon={IconCpu} value={`${activeCount}/${totalCount}`} label="Appliances active" color="var(--colorActive)" glow="color-mix(in srgb, var(--colorActive) 50%, transparent)" />
        <StatCard icon={IconShield} value={`${energyStats.inverterBatteryCharge}%`} label="Inverter backup" color="var(--secondary)" glow="color-mix(in srgb, var(--secondary) 50%, transparent)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: "24px", alignItems: "start" }} className="overviewSplit">
        <div className="fadeUp">
          <HouseholdMap
            devices={devices}
            systemState={systemState}
            lastTriggerResult={lastTriggerResult}
            onToggleDevice={handleToggleDevice}
          />
        </div>
        <div className="fadeUp" style={{ animationDelay: "0.08s" }}>
          <ReasoningPanel lastTriggerResult={lastTriggerResult} />
        </div>
      </div>
    </div>
  );
}
