import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { slots, today } from "../lib/dates.js";
import { DateField } from "./DateField.jsx";
import { SlotSelect } from "./SlotSelect.jsx";

export function validateReading(fields, readings, selectedDate, editingId) {
  const date = new Date(`${fields.date}T12:00:00Z`);
  if (
    !fields.date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fields.date) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== fields.date
  )
    return { field: "date", message: "Please enter a valid calendar date." };
  if (fields.date > today())
    return { field: "date", message: "Date cannot be in the future." };
  if (!slots.some((slot) => slot.id === fields.slot))
    return { field: "slot", message: "Please select a time slot." };
  if (!String(fields.value).trim())
    return { field: "value", message: "Please enter a glucose value." };
  if (
    !/^\d+$/.test(String(fields.value)) ||
    Number(fields.value) < 40 ||
    Number(fields.value) > 600
  )
    return {
      field: "value",
      message: "Value must be a whole number between 40 and 600 mg/dl.",
    };
  const sameDay =
    fields.date === selectedDate
      ? readings.filter((reading) => reading.id !== editingId)
      : [];
  if (sameDay.length >= 4)
    return { field: "slot", message: "You can add only 4 readings per day." };
  if (sameDay.some((reading) => reading.slot === fields.slot))
    return {
      field: "slot",
      message: `You already have a ${slots.find((slot) => slot.id === fields.slot).name} reading for this date.`,
    };
  return null;
}

export function ReadingForm({
  selectedDate,
  readings = [],
  editing,
  initialSlot,
  onSave,
  onCancel,
  onBusyChange,
}) {
  const [fields, setFields] = useState({
    date: editing?.date || selectedDate,
    slot: editing?.slot || initialSlot || "",
    value: editing ? String(editing.value) : "",
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  function change(event) {
    setFields({ ...fields, [event.target.name]: event.target.value });
    setError(null);
  }
  async function submit(event) {
    event.preventDefault();
    const validation = validateReading(
      fields,
      readings,
      selectedDate,
      editing?.id,
    );
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    onBusyChange?.(true);
    setError(null);
    try {
      await onSave({ ...fields, value: Number(fields.value) }, editing?.id);
      setFields((current) => ({ ...current, value: "", slot: "" }));
    } catch (failure) {
      setError(failure);
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }
  const describedBy = (name) =>
    error?.field === name ? "reading-error" : undefined;

  return (
    <section
      className="reading-form-panel"
      aria-labelledby="reading-form-title"
      id="reading-form"
    >
      <div className="section-heading">
        <h2 id="reading-form-title">
          {editing ? "Edit reading" : "A moment to check in."}
        </h2>
        {editing && (
          <button
            className="icon-button"
            aria-label="Cancel editing"
            onClick={onCancel}
            disabled={busy}
          >
            <X size={17} />
          </button>
        )}
      </div>
      <p className="form-intro">
        {editing
          ? "Update your reading below."
          : "Small check-ins. A clearer picture over time."}
      </p>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={busy}>
          <div className="field">
            <label htmlFor="reading-date">Date</label>
            <DateField
              id="reading-date"
              label="Date"
              value={fields.date}
              onChange={(date) => {
                setFields((current) => ({ ...current, date }));
                setError(null);
              }}
              invalid={error?.field === "date"}
              describedBy={describedBy("date")}
            />
          </div>
          <div className="field">
            <label htmlFor="reading-slot">Time slot</label>
            <SlotSelect
              value={fields.slot}
              onChange={(slot) => {
                setFields((current) => ({ ...current, slot }));
                setError(null);
              }}
              invalid={error?.field === "slot"}
              describedBy={describedBy("slot")}
            />
          </div>
          <div className="field glucose-field">
            <label htmlFor="reading-value">Glucose value</label>
            <div className="glucose-input">
              <input
                id="reading-value"
                name="value"
                inputMode="numeric"
                type="text"
                value={fields.value}
                onChange={change}
                placeholder="000"
                autoComplete="off"
                aria-invalid={error?.field === "value"}
                aria-describedby={
                  error?.field === "value"
                    ? "reading-error value-hint"
                    : "value-hint"
                }
              />
              <span>mg/dl</span>
            </div>
            <p id="value-hint">A whole number between 40 and 600 mg/dl.</p>
          </div>
          {error && (
            <p id="reading-error" className="error-message" role="alert">
              {error.message}
            </p>
          )}
          <button className="button save-reading" disabled={busy}>
            {busy
              ? "Saving reading…"
              : editing
                ? "Save changes"
                : "Save reading"}
            {editing ? <Check size={17} /> : <ArrowRight size={17} />}
          </button>
          {editing && (
            <button type="button" className="text-button" onClick={onCancel}>
              Cancel editing
            </button>
          )}
        </fieldset>
      </form>
      <p className="form-footnote">
        <span className="small-dot" /> One reading per slot, up to four a day.
      </p>
    </section>
  );
}
