import React from "react";
import { NavLink } from "react-router-dom";
import {
  IconHome, IconCpu, IconBarChart, IconBrain, IconUsers,
  IconSettings, IconChevronLeft, IconLogOut
} from "../Icons.jsx";

const NAV = [
  { to: "/app", label: "Overview", icon: IconHome, end: true },
  { to: "/app/devices", label: "Devices", icon: IconCpu },
  { to: "/app/energy", label: "Energy", icon: IconBarChart },
  { to: "/app/insights", label: "AI Insights", icon: IconBrain },
  { to: "/app/community", label: "Community", icon: IconUsers },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile, currentUser, onSignOut }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobileOpen" : ""}`}>
      <NavLink to="/app" className="sidebarBrand" onClick={onCloseMobile}>
        <div className="brandMark">🪔</div>
        <div className="brandText">
          <div className="gradientText" style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.4px", lineHeight: 1 }}>
            GharBuddy
          </div>
          <div style={{ fontSize: "10px", color: "var(--textMuted)", marginTop: "2px" }}>घर बड्डी · Smart Home</div>
        </div>
      </NavLink>

      <div className="navGroupLabel">Control Center</div>
      <nav>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onCloseMobile}
            className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
            title={label}
          >
            <span className="navIcon"><Icon width="18" height="18" /></span>
            <span className="navText">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebarFooter">
        {currentUser && !collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", marginBottom: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
              background: "var(--accentSoft)", border: "1px solid var(--accentLine)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--accent)", fontWeight: 700, fontSize: "13px", textTransform: "uppercase"
            }}>
              {(currentUser.username || "U").slice(0, 1)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--textPrimary)" }} className="truncate">
                {currentUser.username}
              </div>
              <div style={{ fontSize: "11px", color: "var(--textMuted)", textTransform: "capitalize" }}>
                {currentUser.role || "member"}
              </div>
            </div>
          </div>
        )}

        {currentUser && (
          <button className="navItem" onClick={onSignOut} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--textMuted)" }} title="Sign out">
            <span className="navIcon"><IconLogOut width="18" height="18" /></span>
            <span className="navText">Sign Out</span>
          </button>
        )}

        <button className="collapseBtn" onClick={onToggleCollapse} style={{ marginTop: "10px" }} title={collapsed ? "Expand" : "Collapse"}>
          <IconChevronLeft width="14" height="14" style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
