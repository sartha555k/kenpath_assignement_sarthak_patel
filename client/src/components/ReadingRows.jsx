import { useState } from "react";
import { Coffee, Moon, Sun, Sunrise, Pencil, Plus, Trash2 } from "lucide-react";
import { slots, formatDate, slotName } from "../lib/dates.js";

const icons = { sunrise: Sunrise, coffee: Coffee, sun: Sun, moon: Moon };

export function ReadingRows({
  readings,
  onEdit,
  onDelete,
  onAdd,
  showDates = false,
  daily = false,
  grouped = false,
}) {
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const entries = daily
    ? slots.map((slot) => ({
        slot,
        reading: readings.find((reading) => reading.slot === slot.id),
      }))
    : readings.map((reading) => ({
        reading,
        slot: slots.find((slot) => slot.id === reading.slot),
      }));

  async function remove(reading) {
    setBusy(true);
    setError("");
    try {
      await onDelete(reading);
      setDeleting(null);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="reading-rows">
      {entries.map(({ slot, reading }) => {
        const Icon = icons[slot.icon];
        return (
          <div className="reading-row-wrap" key={reading?.id || slot.id}>
            <div className={`reading-row ${!reading ? "unrecorded" : ""}`}>
              <span className="slot-icon">
                <Icon size={19} strokeWidth={1.6} />
              </span>
              <div className="slot-description">
                <strong>{slot.name}</strong>
                <span>
                  {showDates && !grouped && reading
                    ? formatDate(reading.date)
                    : slot.id === "morning"
                      ? "Fasting"
                      : reading
                        ? "Recorded"
                        : "Not recorded yet"}
                </span>
              </div>
              <div className="reading-value">
                {reading ? (
                  <>
                    <strong
                      className="saved-value"
                      key={`${reading.id}-${reading.value}`}
                    >
                      {reading.value}
                    </strong>
                    <span>mg/dl</span>
                  </>
                ) : (
                  <span className="no-value">—</span>
                )}
              </div>
              {reading ? (
                <div className="row-actions">
                  <button
                    className="row-icon"
                    aria-label={`Edit ${slotName(reading.slot)}${showDates ? ` on ${reading.date}` : ""}`}
                    onClick={() => {
                      setDeleting(null);
                      onEdit(reading);
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="row-icon delete-icon"
                    aria-label={`Delete ${slotName(reading.slot)}${showDates ? ` on ${reading.date}` : ""}`}
                    onClick={() => {
                      setDeleting(reading.id);
                      setError("");
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  className="row-icon add-slot"
                  aria-label={`Add ${slot.name} reading`}
                  onClick={() => onAdd(slot.id)}
                >
                  <Plus size={17} />
                </button>
              )}
            </div>
            {deleting === reading?.id && (
              <div className="delete-confirm">
                <p>
                  Delete this {slotName(reading.slot).toLowerCase()} reading?
                </p>
                <div>
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => setDeleting(null)}
                  >
                    Keep reading
                  </button>
                  <button
                    className="button danger"
                    disabled={busy}
                    onClick={() => remove(reading)}
                  >
                    {busy ? "Deleting…" : "Delete reading"}
                  </button>
                </div>
                {error && (
                  <p role="alert" className="error-message">
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
