import React from "react";
import { useData } from "../../context/DataContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { IconMenu, IconActivity, IconZap } from "../Icons.jsx";

function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <div className="themeSwitch" role="group" aria-label="Theme">
      {themes.map((t) => (
        <button
          key={t.id}
          className={`themeDot ${t.dot} ${theme === t.id ? "active" : ""}`}
          onClick={() => setTheme(t.id)}
          title={t.label}
          aria-label={t.label}
          style={{ padding: 0 }}
        />
      ))}
    </div>
  );
}

export default function Topbar({ title, subtitle, onOpenMobileNav }) {
  const { systemState, isConnected, error } = useData();

  const conn = (() => {
    const status = isConnected ? "ws" : error ? "offline" : "polling";
    return {
      ws:      { dot: "glowingDot",      label: "Live",    color: "var(--colorSuccess)" },
      polling: { dot: "glowingDotAmber", label: "Polling", color: "var(--colorWarning)" },
      offline: { dot: "glowingDotRed",   label: "Offline", color: "var(--colorDanger)" },
    }[status];
  })();

  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
        <button className="btn btnGhost mobileNavToggle" onClick={onOpenMobileNav} aria-label="Open navigation" style={{ padding: "8px" }}>
          <IconMenu width="18" height="18" />
        </button>
        <div className="topbarTitle">
          <h1 className="truncate">{title}</h1>
          {subtitle && <p className="truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="topbarActions">
        <div className="statusBadge" style={{ background: "var(--accentSoft)", color: "var(--accentText)", borderColor: "var(--accentLine)" }}>
          <IconActivity width="11" height="11" /> {systemState.simulatedTime}
        </div>
        <div className="statusBadge" style={{ background: "color-mix(in srgb, var(--colorActive) 12%, transparent)", color: "var(--colorActive)", borderColor: "color-mix(in srgb, var(--colorActive) 25%, transparent)" }}>
          <IconZap width="11" height="11" /> {systemState.powerStatus}
        </div>
        {systemState.festivalName && (
          <div className="statusBadge" style={{ background: "var(--secondarySoft)", color: "var(--secondary)", borderColor: "color-mix(in srgb, var(--secondary) 30%, transparent)" }}>
            🎉 {systemState.festivalName}
          </div>
        )}
        <div className="statusBadge" style={{ gap: "5px" }}>
          <span className={conn.dot} style={{ width: "6px", height: "6px" }} />
          <span style={{ color: conn.color }}>{conn.label}</span>
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
