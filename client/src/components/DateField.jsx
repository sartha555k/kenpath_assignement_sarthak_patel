import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import { formatDate, today } from "../lib/dates.js";
import "react-day-picker/style.css";

const localDate = (value) => new Date(`${value}T12:00:00`);
const calendarValue = (value) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

export function DateField({
  value,
  onChange,
  id,
  label = "Date",
  invalid,
  describedBy,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          id={id}
          className={`calendar-trigger ${compact ? "compact-date" : ""}`}
          aria-label={label}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        >
          {!compact && <span>{formatDate(value)}</span>}
          <CalendarDays size={compact ? 15 : 17} aria-hidden="true" />
          {compact && <span>{formatDate(value)}</span>}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="calendar-popover"
          sideOffset={8}
          align="start"
          collisionPadding={14}
          aria-label="Choose a date"
        >
          <DayPicker
            mode="single"
            selected={localDate(value)}
            defaultMonth={localDate(value)}
            endMonth={localDate(today())}
            disabled={{ after: localDate(today()) }}
            showOutsideDays
            fixedWeeks
            animate
            autoFocus
            onSelect={(day) => {
              if (day) {
                onChange(calendarValue(day));
                setOpen(false);
              }
            }}
          />
          <div className="calendar-footer">
            <button
              type="button"
              className="text-button"
              onClick={() => {
                onChange(today());
                setOpen(false);
              }}
            >
              Go to today
            </button>
            <span>Future dates are unavailable</span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
