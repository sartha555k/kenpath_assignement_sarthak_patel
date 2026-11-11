import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { slots } from "../lib/dates.js";

export function SlotSelect({ value, onChange, invalid, describedBy }) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        id="reading-slot"
        className="slot-select-trigger"
        aria-label="Time slot"
        aria-invalid={invalid}
        aria-describedby={describedBy}
      >
        <Select.Value placeholder="Select a time slot" />
        <Select.Icon>
          <ChevronDown size={17} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          collisionPadding={14}
          className="slot-select-content"
        >
          <Select.Viewport>
            {slots.map((slot) => (
              <Select.Item
                value={slot.id}
                key={slot.id}
                className="slot-select-item"
              >
                <Select.ItemText>
                  {slot.name}
                  {slot.id === "morning" ? " (fasting)" : ""}
                </Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
