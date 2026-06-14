import React, { useState, useEffect, useRef } from "react";
import { BackendService } from "./Services/BackendService";
import { useWebSocket } from "./hooks/useWebSocket.js";
import SensorSimulator from "./Components/SensorSimulator";
import DeviceGrid from "./Components/DeviceGrid";
import ReasoningPanel from "./Components/ReasoningPanel";
import WhatsAppMock from "./Components/WhatsAppMock";
import EnergyTracker from "./Components/EnergyTracker";
import HouseholdMap from "./Components/HouseholdMap";
import VoiceWidget from "./Components/VoiceWidget";
import CommunityEnergyDashboard from "./Components/CommunityEnergyDashboard";
import LoginModal from "./Components/LoginModal";
import {
  IconZap, IconUser, IconLogOut, IconWifi, IconActivity, IconShield
} from "./Components/Icons.jsx";

export default function App() {
  const [devices, setDevices] = useState({});
  const [energyStats, setEnergyStats] = useState({
    totalSavedWh: 4200,
    rupeesSaved: 34,
    peakPowerAvoidedW: 750,
    inverterBatteryCharge: 85
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
    eventHistory: []
  });
  const [lastTriggerResult, setLastTriggerResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Session-backed auth token (Issue #6 — full login gate)
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem("gb_token") || "");
  const [loginError, setLoginError] = useState("");
  const [loginForm, setLoginForm] = useState({ username: "admin", password: "gharbuddy123" });

  const { isConnected, lastMessage } = useWebSocket("ws://localhost:8000/ws");
  const pollingIntervalRef = useRef(null);

  // Core data synchronization
  const syncData = async () => {
    // Preserve scroll position across polling re-renders
    const scrollY = window.scrollY;
    try {
      const [devicesRes, energyRes, notificationsRes, systemRes] = await Promise.all([
        BackendService.getDevices(),
        BackendService.getEnergyStats(),
        BackendService.getNotifications(),
        BackendService.getSystemState()
      ]);

      // Batch all state updates in one React flush to avoid multiple re-renders
      setDevices(devicesRes);
      setEnergyStats(energyRes);
      setNotifications(notificationsRes);
      setSystemState(systemRes);
      setLoading(false);
    } catch (e) {
      console.error("Sync error:", e);
      setError("Unable to connect to GharBuddy API. Please verify the FastAPI server is running.");
      setLoading(false);
    } finally {
      // Restore scroll position after React re-render
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: "instant" }));
    }
  };

  // Initial data fetch — runs once on mount regardless of WebSocket state
  useEffect(() => {
    syncData();
  }, []);

  // Restore session from localStorage on mount (legacy token support)
  useEffect(() => {
    const token = localStorage.getItem("gharbuddy_token");
    const userJson = localStorage.getItem("gharbuddy_user");
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        // Also populate sessionStorage token if not already set
        if (!sessionStorage.getItem("gb_token")) {
          sessionStorage.setItem("gb_token", token);
          setAuthToken(token);
        }
      } catch (_) {
        // Ignore malformed stored user
      }
    }
  }, []);

  // Issue #6 — Handle login form submission (full-page gate)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      if (!res.ok) { setLoginError("Invalid credentials"); return; }
      const data = await res.json();
      sessionStorage.setItem("gb_token", data.access_token);
      setAuthToken(data.access_token);
      setCurrentUser({ username: data.username, role: data.role });
      setLoginError("");
    } catch (_e) {
      setLoginError("Cannot connect to backend");
    }
  };

  // Effect A — handle WebSocket messages
  useEffect(() => {
    if (!lastMessage || lastMessage.type === "ping") return;
    if (lastMessage.devices) setDevices(lastMessage.devices);
    if (lastMessage.energyStats) setEnergyStats(lastMessage.energyStats);
    if (lastMessage.notifications) setNotifications(lastMessage.notifications);
    if (lastMessage.systemState) setSystemState(lastMessage.systemState);
    setLoading(false);
  }, [lastMessage]);

  // Effect B — manage polling as fallback when WebSocket is disconnected
  useEffect(() => {
    if (isConnected) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    } else {
      if (!pollingIntervalRef.current) {
        syncData(); // immediate sync when falling back to polling
        pollingIntervalRef.current = setInterval(syncData, 3000);
      }
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
      // Remove or resolve active suggestion locally
      await syncData();
    } catch (e) {
      console.error("Error approving action:", e);
    }
  };

  // Issue #6 — Full-page login gate: show login screen until authenticated
  if (!authToken) {
    return (
      <div className="loginPage">
        <div className="loginCard fadeIn">
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(245,158,11,0.15) 100%)",
              border: "1px solid rgba(249,115,22,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: "26px"
            }}>🪔</div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "4px" }}>
              <span className="gradientText">GharBuddy</span>
            </h1>
            <p style={{ color: "var(--textMuted)", fontSize: "12px" }}>
              AI Smart Home · Indian Households
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--textSecondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--textMuted)" }}>
                  <IconUser width="14" height="14" />
                </span>
                <input
                  value={loginForm.username}
                  onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="admin"
                  aria-label="Username"
                  style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--textSecondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--textMuted)" }}>
                  <IconShield width="14" height="14" />
                </span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  aria-label="Password"
                  style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>
            </div>

            {loginError && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "var(--colorDanger)",
                display: "flex", alignItems: "center", gap: "6px"
              }}>
                <span>⚠</span> {loginError}
              </div>
            )}

            <button type="submit" className="btn btnPrimary" style={{ width: "100%", padding: "11px", fontSize: "14px", justifyContent: "center", marginTop: "4px" }}>
              Sign In →
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: "20px", padding: "12px", borderRadius: "8px",
            background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
            fontSize: "11px", color: "var(--textMuted)"
          }}>
            <div style={{ fontWeight: "700", color: "var(--textSecondary)", marginBottom: "4px" }}>Demo credentials</div>
            <div style={{ display: "flex", gap: "16px" }}>
              <span><code style={{ color: "#a5b4fc" }}>admin</code> / <code style={{ color: "#a5b4fc" }}>gharbuddy123</code></span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span><code style={{ color: "#6ee7b7" }}>child</code> / <code style={{ color: "#6ee7b7" }}>child123</code></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && Object.keys(devices).length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center", gap: "14px", background: "var(--bgBase)" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "14px",
          background: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(245,158,11,0.1) 100%)",
          border: "1px solid rgba(249,115,22,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px"
        }}>🪔</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="glowingDot" style={{ width: "6px", height: "6px" }}></span>
          <span style={{ fontSize: "14px", color: "var(--textSecondary)", fontWeight: "500" }}>Powering on GharBuddy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="appContainer">
      {/* ── Header ── */}
      <header className="appHeader">
        {/* Logo */}
        <div className="appLogo">
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(245,158,11,0.12) 100%)",
            border: "1px solid rgba(249,115,22,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0
          }}>🪔</div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span className="gradientText" style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.4px" }}>GharBuddy</span>
              <span style={{ fontSize: "11px", color: "var(--textMuted)", fontWeight: "500" }}>घर बड्डी</span>
            </div>
            <p style={{ fontSize: "10px", color: "var(--textMuted)", letterSpacing: "0.1px", marginTop: "1px" }}>
              AI Smart Home · Indian Households
            </p>
          </div>
        </div>

        {/* Right badges */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Time */}
          <div className="statusBadge" style={{ background: "rgba(249,115,22,0.08)", color: "var(--colorOrange)", borderColor: "rgba(249,115,22,0.15)" }}>
            <IconActivity width="11" height="11" />
            {systemState.simulatedTime}
          </div>

          {/* Power */}
          <div className="statusBadge" style={{ background: "rgba(59,130,246,0.08)", color: "var(--colorActive)", borderColor: "rgba(59,130,246,0.15)" }}>
            <IconZap width="11" height="11" />
            {systemState.powerStatus}
          </div>

          {/* Festival */}
          {systemState.festivalName && (
            <div className="statusBadge" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", borderColor: "rgba(139,92,246,0.2)" }}>
              🎉 {systemState.festivalName}
            </div>
          )}

          {/* Connection status */}
          {(() => {
            const status = isConnected ? "ws" : error ? "offline" : "polling";
            const cfg = {
              ws:      { dot: "glowingDot",       label: "Live",    color: "var(--colorSuccess)" },
              polling: { dot: "glowingDotAmber",   label: "Polling", color: "var(--colorWarning)" },
              offline: { dot: "glowingDotRed",     label: "Offline", color: "var(--colorDanger)"  },
            }[status];
            return (
              <div className="statusBadge" style={{ gap: "5px" }}>
                <span className={cfg.dot} style={{ width: "6px", height: "6px" }}></span>
                <span style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
            );
          })()}

          {/* User */}
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div className="statusBadge" style={{ background: "rgba(34,197,94,0.08)", color: "var(--colorSuccess)", borderColor: "rgba(34,197,94,0.15)", gap: "5px" }}>
                <IconUser width="11" height="11" />
                <span>{currentUser.username}</span>
                <span style={{ opacity: 0.5, fontSize: "9px" }}>{currentUser.role}</span>
              </div>
              <button
                onClick={() => {
                  sessionStorage.removeItem("gb_token");
                  localStorage.removeItem("gharbuddy_token");
                  localStorage.removeItem("gharbuddy_user");
                  setAuthToken("");
                  setCurrentUser(null);
                }}
                className="btn btnGhost"
                style={{ padding: "4px 8px", fontSize: "11px", gap: "4px" }}
                aria-label="Sign out"
              >
                <IconLogOut width="12" height="12" />
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="btn btnPrimary" style={{ fontSize: "12px", padding: "5px 12px" }}>
              Sign In
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="alertBanner" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "var(--colorDanger)", marginBottom: "20px" }}>
          <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: "600", marginBottom: "2px" }}>Backend Offline</div>
            <div style={{ fontSize: "11px", color: "var(--textMuted)" }}>
              Start the server: <code style={{ color: "var(--colorDanger)", fontSize: "10px" }}>uvicorn Backend.MainFastApi:app --reload --port 8000</code>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <main className="dashboardGrid">
        {/* Left Column: Appliances, energy stats, and simulator triggers */}
        <div className="columnLeft">
          <HouseholdMap devices={devices} systemState={systemState} lastTriggerResult={lastTriggerResult} onToggleDevice={handleToggleDevice} />
          <DeviceGrid devices={devices} onToggleDevice={handleToggleDevice} />
          <VoiceWidget />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <EnergyTracker energyStats={energyStats} />
            <SensorSimulator systemState={systemState} onStateChange={handleStateChange} />
          </div>
        </div>

        {/* Right Column: Bedrock AI Reasoning Log & WhatsApp mockup */}
        <div className="columnRight">
          <ReasoningPanel lastTriggerResult={lastTriggerResult} />
          <WhatsAppMock notifications={notifications} onApproveAction={handleApproveAction} />
          <CommunityEnergyDashboard />
        </div>
      </main>

      <footer style={{ marginTop: "48px", textAlign: "center", padding: "20px 0", borderTop: "1px solid var(--borderSubtle)", fontSize: "11px", color: "var(--textMuted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        <span style={{ fontSize: "14px" }}>🪔</span>
        GharBuddy Smart Systems
        <span style={{ opacity: 0.3 }}>·</span>
        HackOn with Amazon Season 6.0
        <span style={{ opacity: 0.3 }}>·</span>
        Powered by AWS Bedrock Claude &amp; IoT Core
      </footer>
      {showLogin && (
        <LoginModal
          onLogin={(u) => {
            const token = u.access_token || u.token || "";
            if (token) {
              sessionStorage.setItem("gb_token", token);
              setAuthToken(token);
            }
            setCurrentUser({ username: u.username, role: u.role });
            setShowLogin(false);
          }}
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}
