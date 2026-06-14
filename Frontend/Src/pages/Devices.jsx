import React from "react";
import { useData } from "../context/DataContext.jsx";
import DeviceGrid from "../Components/DeviceGrid.jsx";
import VoiceWidget from "../Components/VoiceWidget.jsx";
import SensorSimulator from "../Components/SensorSimulator.jsx";

export default function Devices() {
  const { devices, systemState, handleToggleDevice, handleStateChange } = useData();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="stagger">
      <DeviceGrid devices={devices} onToggleDevice={handleToggleDevice} />
      <VoiceWidget />
      <SensorSimulator systemState={systemState} onStateChange={handleStateChange} />
    </div>
  );
}
