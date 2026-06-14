import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconUser, IconShield, IconArrowRight } from "../Components/Icons.jsx";

export default function Login({ onAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "admin", password: "gharbuddy123" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { setError("Invalid credentials"); setBusy(false); return; }
      const data = await res.json();
      onAuthenticated(data.access_token, { username: data.username, role: data.role });
      navigate("/app");
    } catch (_e) {
      setError("Cannot connect to backend");
      setBusy(false);
    }
  };

  const labelStyle = { display: "block", fontSize: "11px", fontWeight: 600, color: "var(--textSecondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" };
  const iconWrap = { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--textMuted)" };
  const inputStyle = { width: "100%", padding: "11px 12px 11px 38px", borderRadius: "10px", fontSize: "14px" };

  return (
    <div className="loginPage">
      <motion.div className="loginCard" initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div className="brandMark" style={{ width: "56px", height: "56px", margin: "0 auto 16px", fontSize: "26px", borderRadius: "16px" }}>🪔</div>
          <h1 style={{ fontSize: "23px", fontWeight: 800, marginBottom: "4px" }}><span className="gradientText">GharBuddy</span></h1>
          <p style={{ color: "var(--textMuted)", fontSize: "12px" }}>AI Smart Home · Indian Households</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Username</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><IconUser width="14" height="14" /></span>
              <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="admin" aria-label="Username" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><IconShield width="14" height="14" /></span>
              <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" aria-label="Password" style={inputStyle} />
            </div>
          </div>

          {error && (
            <div style={{ background: "color-mix(in srgb, var(--colorDanger) 9%, transparent)", border: "1px solid color-mix(in srgb, var(--colorDanger) 22%, transparent)", borderRadius: "10px", padding: "9px 12px", fontSize: "12px", color: "var(--colorDanger)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>⚠</span> {error}
            </div>
          )}

          <button type="submit" className="btn btnPrimary" disabled={busy} style={{ width: "100%", padding: "12px", fontSize: "14px", justifyContent: "center", marginTop: "4px" }}>
            {busy ? "Signing in…" : <>Sign In <IconArrowRight width="15" height="15" /></>}
          </button>
        </form>

        <div style={{ marginTop: "20px", padding: "12px", borderRadius: "10px", background: "var(--secondarySoft)", border: "1px solid color-mix(in srgb, var(--secondary) 18%, transparent)", fontSize: "11px", color: "var(--textMuted)" }}>
          <div style={{ fontWeight: 700, color: "var(--textSecondary)", marginBottom: "4px" }}>Demo credentials</div>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <span><code style={{ color: "var(--accentText)" }}>admin</code> / <code style={{ color: "var(--accentText)" }}>gharbuddy123</code></span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span><code style={{ color: "var(--secondary)" }}>child</code> / <code style={{ color: "var(--secondary)" }}>child123</code></span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "18px" }}>
          <Link to="/" style={{ fontSize: "12px", color: "var(--textMuted)", textDecoration: "none" }}>← Back to home</Link>
        </div>
      </motion.div>
    </div>
  );
}
