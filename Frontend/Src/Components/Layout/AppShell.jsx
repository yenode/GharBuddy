import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

const PAGE_META = {
  "/app":           { title: "Home Overview",   subtitle: "A living view of your household, right now" },
  "/app/devices":   { title: "Smart Appliances", subtitle: "Control and monitor every connected device" },
  "/app/energy":    { title: "Energy & Savings",  subtitle: "Consumption, costs and load-shedding insight" },
  "/app/insights":  { title: "AI Insights",       subtitle: "How GharBuddy reasons and reaches out" },
  "/app/community": { title: "Community Energy",   subtitle: "Your neighbourhood micro-grid at a glance" },
};

export default function AppShell({ currentUser, onSignOut }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: "GharBuddy", subtitle: "" };

  return (
    <div className="appShell">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        currentUser={currentUser}
        onSignOut={onSignOut}
      />
      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}

      <div className="shellMain">
        <Topbar title={meta.title} subtitle={meta.subtitle} onOpenMobileNav={() => setMobileOpen(true)} />
        <div className="pageWrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
