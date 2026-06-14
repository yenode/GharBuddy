import React from "react";
import { useData } from "../context/DataContext.jsx";
import EnergyTracker from "../Components/EnergyTracker.jsx";
import CommunityEnergyDashboard from "../Components/CommunityEnergyDashboard.jsx";

export default function Energy() {
  const { energyStats } = useData();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="stagger">
      <EnergyTracker energyStats={energyStats} />
      <CommunityEnergyDashboard />
    </div>
  );
}
