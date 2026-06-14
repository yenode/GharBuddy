import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { BackendService } from "../Services/BackendService";
import { useWebSocket } from "../hooks/useWebSocket.js";

const DataContext = createContext(null);

/**
 * Provides live smart-home data (devices, energy, notifications, system state)
 * plus action handlers. Polling/WebSocket only run while this provider is
 * mounted — i.e. behind the authenticated app shell.
 */
export function DataProvider({ authToken, children }) {
  const [devices, setDevices] = useState({});
  const [energyStats, setEnergyStats] = useState({
    totalSavedWh: 4200,
    rupeesSaved: 34,
    peakPowerAvoidedW: 750,
    inverterBatteryCharge: 85,
  });
  const [notifications, setNotifications] = useState([]);
  const [systemState, setSystemState] = useState({
    simulatedTime: "06:00:00",
    simulatedDate: "06-13",
    powerStatus: "GRID",
    whistleCount: 0,
    targetWhistles: 3,
    isFastingDay: false,
    festivalName: null,
    eventHistory: [],
  });
  const [lastTriggerResult, setLastTriggerResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isConnected, lastMessage } = useWebSocket("ws://localhost:8000/ws");
  const pollingIntervalRef = useRef(null);

  const syncData = async () => {
    try {
      const [devicesRes, energyRes, notificationsRes, systemRes] = await Promise.all([
        BackendService.getDevices(),
        BackendService.getEnergyStats(),
        BackendService.getNotifications(),
        BackendService.getSystemState(),
      ]);
      setDevices(devicesRes);
      setEnergyStats(energyRes);
      setNotifications(notificationsRes);
      setSystemState(systemRes);
      setError(null);
      setLoading(false);
    } catch (e) {
      console.error("Sync error:", e);
      setError("Unable to connect to GharBuddy API. Please verify the FastAPI server is running.");
      setLoading(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  // WebSocket messages
  useEffect(() => {
    if (!lastMessage || lastMessage.type === "ping") return;
    if (lastMessage.devices) setDevices(lastMessage.devices);
    if (lastMessage.energyStats) setEnergyStats(lastMessage.energyStats);
    if (lastMessage.notifications) setNotifications(lastMessage.notifications);
    if (lastMessage.systemState) setSystemState(lastMessage.systemState);
    setLoading(false);
  }, [lastMessage]);

  // Polling fallback
  useEffect(() => {
    if (isConnected) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    } else if (!pollingIntervalRef.current) {
      syncData();
      pollingIntervalRef.current = setInterval(syncData, 3000);
    }
    return () => clearInterval(pollingIntervalRef.current);
  }, [isConnected]);

  const handleStateChange = async (type, payload) => {
    try {
      if (type === "settings") {
        await BackendService.updateSettings(payload, authToken);
      } else if (type === "sensor") {
        const response = await BackendService.triggerSensor(payload.sensorId, payload.value, authToken);
        setLastTriggerResult(response);
      }
      await syncData();
    } catch (e) {
      console.error("Error setting state:", e);
    }
  };

  const handleToggleDevice = async (deviceId, status) => {
    try {
      await BackendService.toggleDevice(deviceId, status, authToken);
      await syncData();
    } catch (e) {
      console.error("Error toggling device:", e);
    }
  };

  const handleApproveAction = async (actionId, approve) => {
    try {
      await BackendService.approveAction(actionId, approve, authToken);
      await syncData();
    } catch (e) {
      console.error("Error approving action:", e);
    }
  };

  const value = {
    devices, energyStats, notifications, systemState,
    lastTriggerResult, loading, error,
    isConnected,
    handleStateChange, handleToggleDevice, handleApproveAction,
    refresh: syncData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
