import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DatePicker } from "../components/DatePicker.jsx";
import { today } from "../lib/dates.js";

describe("report date selection", () => {
  it("selects a date through the calendar and closes it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker date="2024-03-01" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Selected date" }));
    await user.click(
      screen.getByRole("button", { name: /February 29th, 2024/ }),
    );
    expect(onChange).toHaveBeenCalledWith("2024-02-29");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("navigates across leap-day boundaries and disables tomorrow", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <DatePicker date="2024-03-01" onChange={onChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Previous day" }));
    expect(onChange).toHaveBeenCalledWith("2024-02-29");
    rerender(<DatePicker date={today()} onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Next day" })).toBeDisabled();
  });
});
