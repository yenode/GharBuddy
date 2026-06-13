import React, { useEffect, useRef } from "react";

export default function WhatsAppMock({ notifications, onApproveAction }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notifications]);

  return (
    <div className="glassCard" style={{ padding: "0", display: "flex", flexDirection: "column", height: "450px", overflow: "hidden" }}>
      {/* Phone Header Mockup */}
      <div style={{ background: "#075e54", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
          🤖
        </div>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>GharBuddy (घर बड्डी)</h3>
          <span style={{ fontSize: "11px", color: "#dcf8c6", opacity: 0.85 }}>Online • Smart Home Bot</span>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "#0b141a" }}>
        {notifications.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--textMuted)", fontSize: "13px" }}>
            <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>💬</span>
            No WhatsApp alerts sent yet.<br />Trigger a sensor action to see messages.
          </div>
        ) : (
          notifications.map((notif, index) => (
            <div
              key={index}
              style={{
                alignSelf: "flex-start",
                background: "#202c33",
                color: "#e9edef",
                padding: "10px 12px",
                borderRadius: "8px",
                maxWidth: "85%",
                fontSize: "13px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                lineHeight: "1.4"
              }}
            >
              <div style={{ fontWeight: "700", color: "#00a884", fontSize: "11px", marginBottom: "4px" }}>
                GharBuddy API Alert • {notif.timestamp}
              </div>
              <div style={{ whiteSpace: "pre-line" }}>{notif.message}</div>
              
              {/* If Twilio delivery indicator */}
              {notif.sentViaTwilio && (
                <div style={{ fontSize: "10px", color: "#8696a0", marginTop: "4px", textAlign: "right" }}>
                  ✓ Sent to Phone
                </div>
              )}

              {/* Suggestions Override Toggles */}
              {notif.suggestActions && notif.actionId && (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
                  <button
                    onClick={() => onApproveAction(notif.actionId, true)}
                    style={{
                      flex: 1,
                      background: "#00a884",
                      border: "none",
                      borderRadius: "6px",
                      color: "black",
                      fontWeight: "700",
                      padding: "6px 0",
                      cursor: "pointer",
                      fontSize: "11px"
                    }}
                  >
                    हाँ, कर दो (Yes)
                  </button>
                  <button
                    onClick={() => onApproveAction(notif.actionId, false)}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                      color: "#ea4335",
                      fontWeight: "700",
                      padding: "6px 0",
                      cursor: "pointer",
                      fontSize: "11px"
                    }}
                  >
                    नहीं, रुक जाओ (No)
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Phone Footer Input Mockup */}
      <div style={{ background: "#111b21", padding: "10px 16px", display: "flex", gap: "8px", alignItems: "center", borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}>
        <input
          type="text"
          placeholder="Type WhatsApp command (e.g. Motor band karo)..."
          disabled
          style={{
            flex: 1,
            padding: "8px 12px",
            background: "#2a3942",
            border: "none",
            borderRadius: "18px",
            color: "#8696a0",
            fontSize: "13px"
          }}
        />
        <button
          disabled
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#00a884",
            border: "none",
            color: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px"
          }}
        >
          🎙️
        </button>
      </div>
    </div>
  );
}
