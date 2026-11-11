import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DatePicker } from "../components/DatePicker.jsx";
import { today } from "../lib/dates.js";

describe("report date selection", () => {
  it("passes calendar changes to the dashboard and ignores empty/future input", () => {
    const onChange = vi.fn();
    render(<DatePicker date="2024-03-01" onChange={onChange} />);
    const calendar = screen.getByLabelText("Selected date");
    fireEvent.change(calendar, { target: { value: "2024-02-29" } });
    expect(onChange).toHaveBeenCalledWith("2024-02-29");
    onChange.mockClear();
    fireEvent.change(calendar, { target: { value: "" } });
    fireEvent.change(calendar, { target: { value: "2099-01-01" } });
    expect(onChange).not.toHaveBeenCalled();
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
