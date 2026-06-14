import React, { createContext, useContext, useEffect, useState } from "react";

export const THEMES = [
  { id: "midnight", label: "Midnight Saffron", dot: "tMidnight" },
  { id: "royal",    label: "Royal Indigo",     dot: "tRoyal" },
  { id: "forest",   label: "Forest Teal",      dot: "tForest" },
  { id: "dawn",     label: "Dawn Light",       dot: "tDawn" },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem("gb_theme") || "midnight"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gb_theme", theme);
  }, [theme]);

  const setTheme = (id) => {
    if (THEMES.some((t) => t.id === id)) setThemeState(id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
