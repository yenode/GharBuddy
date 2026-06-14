/**
 * Integration test: Topbar renders the correct connection-status badge
 * based on the live data context (driven by useWebSocket).
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 *
 * Strategy: mock the DataContext so we can isolate the badge rendering
 * logic in Topbar without spinning up the full provider / websocket.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mock contexts consumed by Topbar — must come before import of Topbar
// ---------------------------------------------------------------------------

const mockData = { isConnected: true, error: null, systemState: { simulatedTime: "06:00:00", powerStatus: "GRID", festivalName: null } };

vi.mock("../context/DataContext.jsx", () => ({
  useData: () => mockData,
}));

vi.mock("../context/ThemeContext.jsx", () => ({
  useTheme: () => ({
    theme: "midnight",
    setTheme: vi.fn(),
    themes: [{ id: "midnight", label: "Midnight", dot: "tMidnight" }],
  }),
}));

import Topbar from "../Components/Layout/Topbar.jsx";

afterEach(() => {
  vi.clearAllMocks();
});

describe("Topbar connection-status badge", () => {
  it('displays "Live" badge when isConnected is true', () => {
    mockData.isConnected = true;
    mockData.error = null;
    render(<Topbar title="Overview" onOpenMobileNav={() => {}} />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it('displays "Polling" badge when isConnected is false and no error', () => {
    mockData.isConnected = false;
    mockData.error = null;
    render(<Topbar title="Overview" onOpenMobileNav={() => {}} />);
    expect(screen.getByText("Polling")).toBeInTheDocument();
  });

  it('displays "Offline" badge when isConnected is false and an error is present', () => {
    mockData.isConnected = false;
    mockData.error = "Backend offline";
    render(<Topbar title="Overview" onOpenMobileNav={() => {}} />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });
});
