import { formatDate, today } from "../lib/dates.js";
import { ReadingRows } from "./ReadingRows.jsx";

export function HistoryGroups({ readings, onEdit, onDelete }) {
  const groups = Map.groupBy(readings, (reading) => reading.date);
  return (
    <div className="history-groups">
      {[...groups].map(([date, entries]) => (
        <section
          className="history-day"
          key={date}
          aria-label={`Readings for ${formatDate(date)}`}
        >
          <header>
            <div>
              <h3>
                {date === today()
                  ? "Today"
                  : formatDate(date, { weekday: "long" })}
              </h3>
              <time dateTime={date}>{formatDate(date)}</time>
            </div>
            <span>{entries.length} of 4 slots recorded</span>
          </header>
          <ReadingRows
            readings={entries}
            onEdit={onEdit}
            onDelete={onDelete}
            showDates
            grouped
          />
        </section>
      ))}
    </div>
  );
}
