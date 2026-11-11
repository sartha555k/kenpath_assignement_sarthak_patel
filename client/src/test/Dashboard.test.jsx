import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi, beforeEach } from "vitest";
import { Dashboard } from "../components/Dashboard.jsx";
import { api } from "../lib/api.js";
import { today } from "../lib/dates.js";
vi.mock("../lib/api.js", () => ({ api: vi.fn() }));
const reading = { id: 1, date: today(), slot: "morning", value: 100 };
const summary = {
  startDate: today(),
  endDate: today(),
  count: 1,
  highest: 100,
  lowest: 100,
  average: 100,
};
function reports(value = 100) {
  return {
    reports: {
      daily: { ...summary, readings: [{ ...reading, value }] },
      monthToDate: summary,
      monthly: summary,
    },
  };
}
beforeEach(() => {
  api.mockReset();
});

it("adds a reading from reports without navigating away", async () => {
  api.mockImplementation((path) =>
    Promise.resolve(
      path.startsWith("/reports")
        ? reports()
        : { readings: [reading], pagination: { totalPages: 1 } },
    ),
  );
  const user = userEvent.setup();
  render(<Dashboard user={{ name: "Alex" }} onLogout={vi.fn()} />);
  await screen.findByRole("button", { name: "Edit Morning" });
  await user.click(
    within(
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).getByRole("button", { name: "Reports" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Add reading", exact: true }),
  );
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(
    screen.getByText("Keep your report open while you record a reading."),
  ).toBeInTheDocument();
  expect(screen.getByText("See the bigger picture.")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Close reading form" }));
  expect(
    screen.getByRole("heading", { name: "See the bigger picture." }),
  ).toBeVisible();
});

it("keeps reading rows mounted while refreshing after an edit", async () => {
  let reportRequests = 0;
  let finishRefresh;
  api.mockImplementation((path, options) => {
    if (options?.method === "PUT")
      return Promise.resolve({ reading: { ...reading, value: 110 } });
    if (path.startsWith("/reports")) {
      if (++reportRequests === 1) return Promise.resolve(reports());
      return new Promise((resolve) => {
        finishRefresh = () => resolve(reports(110));
      });
    }
    return Promise.resolve({
      readings: [reading],
      pagination: { totalPages: 1 },
    });
  });
  const user = userEvent.setup();
  render(<Dashboard user={{ name: "Alex" }} onLogout={vi.fn()} />);
  await user.click(await screen.findByRole("button", { name: "Edit Morning" }));
  const row = screen
    .getByRole("button", { name: "Edit Morning" })
    .closest(".reading-row");
  await user.clear(screen.getByLabelText("Glucose value"));
  await user.type(screen.getByLabelText("Glucose value"), "110");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(finishRefresh).toBeTypeOf("function"));
  expect(row.isConnected).toBe(true);
  expect(screen.queryByText("Loading your readings…")).not.toBeInTheDocument();
  await act(async () => finishRefresh());
  expect(row.isConnected).toBe(true);
});
