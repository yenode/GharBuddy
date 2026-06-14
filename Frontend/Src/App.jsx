import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext.jsx";
import AppShell from "./Components/Layout/AppShell.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Overview from "./pages/Overview.jsx";
import Devices from "./pages/Devices.jsx";
import Energy from "./pages/Energy.jsx";
import Insights from "./pages/Insights.jsx";
import Community from "./pages/Community.jsx";

export default function App() {
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem("gb_token") || "");
  const [currentUser, setCurrentUser] = useState(null);

  // Restore legacy session on mount
  useEffect(() => {
    const token = localStorage.getItem("gharbuddy_token");
    const userJson = localStorage.getItem("gharbuddy_user");
    if (token && userJson) {
      try {
        setCurrentUser(JSON.parse(userJson));
        if (!sessionStorage.getItem("gb_token")) {
          sessionStorage.setItem("gb_token", token);
          setAuthToken(token);
        }
      } catch (_) { /* ignore malformed */ }
    }
  }, []);

  const handleAuthenticated = (token, user) => {
    if (token) {
      sessionStorage.setItem("gb_token", token);
      setAuthToken(token);
    }
    setCurrentUser(user);
    if (user) localStorage.setItem("gharbuddy_user", JSON.stringify(user));
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("gb_token");
    localStorage.removeItem("gharbuddy_token");
    localStorage.removeItem("gharbuddy_user");
    setAuthToken("");
    setCurrentUser(null);
  };

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={authToken ? <Navigate to="/app" replace /> : <Login onAuthenticated={handleAuthenticated} />}
      />

      {authToken ? (
        <Route
          path="/app"
          element={
            <DataProvider authToken={authToken}>
              <AppShell currentUser={currentUser} onSignOut={handleSignOut} />
            </DataProvider>
          }
        >
          <Route index element={<Overview />} />
          <Route path="devices" element={<Devices />} />
          <Route path="energy" element={<Energy />} />
          <Route path="insights" element={<Insights />} />
          <Route path="community" element={<Community />} />
        </Route>
      ) : (
        <Route path="/app/*" element={<Navigate to="/login" replace />} />
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
