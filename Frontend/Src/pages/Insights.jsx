import React from "react";
import { useData } from "../context/DataContext.jsx";
import ReasoningPanel from "../Components/ReasoningPanel.jsx";
import WhatsAppMock from "../Components/WhatsAppMock.jsx";
import SensorSimulator from "../Components/SensorSimulator.jsx";

export default function Insights() {
  const { lastTriggerResult, notifications, systemState, handleApproveAction, handleStateChange } = useData();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="dualGrid stagger" style={{ alignItems: "start" }}>
        <ReasoningPanel lastTriggerResult={lastTriggerResult} />
        <WhatsAppMock notifications={notifications} onApproveAction={handleApproveAction} />
      </div>
      <div className="fadeUp">
        <SensorSimulator systemState={systemState} onStateChange={handleStateChange} />
      </div>
    </div>
  );
}
