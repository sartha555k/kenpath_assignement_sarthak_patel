import { useId, useRef, useState } from "react";
import { formatDate, slotName } from "../lib/dates.js";

export function TrendChart({ readings = [] }) {
  const chartId = useId();
  const [selectedId, setSelectedId] = useState(null);
  const pointRefs = useRef(new Map());
  const selected = readings.find((reading) => reading.id === selectedId);
  const activeIndex = Math.max(
    0,
    readings.findIndex((reading) => reading.id === selectedId),
  );
  function pointKey(event, index) {
    const moves = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: readings.length - 1,
    };
    if (Object.hasOwn(moves, event.key)) {
      event.preventDefault();
      const next = Math.max(0, Math.min(readings.length - 1, moves[event.key]));
      setSelectedId(readings[next].id);
      pointRefs.current.get(readings[next].id)?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedId(readings[index].id);
    }
  }
  if (!readings.length)
    return (
      <div className="chart-empty">
        <p>Your month starts with a reading.</p>
        <span>Add a reading to see your glucose history here.</span>
      </div>
    );
  const values = readings.map((reading) => reading.value);
  const low = Math.max(0, Math.floor((Math.min(...values) - 20) / 20) * 20);
  const high = Math.ceil((Math.max(...values) + 20) / 20) * 20;
  const width = 650;
  const height = 180;
  const x = (index) =>
    45 +
    (readings.length === 1
      ? (width - 65) / 2
      : (index / (readings.length - 1)) * (width - 65));
  const y = (value) => 18 + ((high - value) / (high - low)) * (height - 50);
  const points = readings
    .map((reading, index) => `${x(index)},${y(reading.value)}`)
    .join(" ");
  function inspectPoint(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * width;
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * height;
    let closest = 0;
    let distance = Infinity;
    readings.forEach((reading, index) => {
      const next = Math.hypot(x(index) - pointerX, y(reading.value) - pointerY);
      if (next < distance) {
        closest = index;
        distance = next;
      }
    });
    setSelectedId(readings[closest].id);
  }
  const ticks = [high, (high + low) / 2, low];
  const labels = [
    ...new Set([0, Math.floor((readings.length - 1) / 2), readings.length - 1]),
  ];
  return (
    <div className="trend-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-labelledby={chartId}
        onPointerDown={inspectPoint}
      >
        <title id={chartId}>
          Glucose readings this month, ranging from {Math.min(...values)} to{" "}
          {Math.max(...values)} mg/dl. Exact readings are available in Reading
          history.
        </title>
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1="45"
              y1={y(tick)}
              x2={width - 20}
              y2={y(tick)}
              stroke="#e1e6f0"
              strokeDasharray="3 5"
            />
            <text x="0" y={y(tick) + 4} fill="#5d6c83" fontSize="11">
              {tick}
            </text>
          </g>
        ))}
        <polyline
          fill="none"
          stroke="#7e95d6"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        {readings.map((reading, index) => (
          <g
            role="button"
            tabIndex={index === activeIndex ? 0 : -1}
            aria-label={`${formatDate(reading.date)}, ${slotName(reading.slot)}, ${reading.value} mg/dl`}
            aria-pressed={reading.id === selectedId}
            key={reading.id}
            ref={(node) => {
              if (node) pointRefs.current.set(reading.id, node);
              else pointRefs.current.delete(reading.id);
            }}
            onClick={() => setSelectedId(reading.id)}
            onFocus={() => setSelectedId(reading.id)}
            onMouseEnter={() => setSelectedId(reading.id)}
            onKeyDown={(event) => pointKey(event, index)}
          >
            <circle
              cx={x(index)}
              cy={y(reading.value)}
              r="11"
              fill="transparent"
            />
            <circle
              key={reading.id}
              cx={x(index)}
              cy={y(reading.value)}
              r="3.5"
              fill="var(--accent)"
              stroke="white"
              strokeWidth="1.5"
            >
              <title>
                {formatDate(reading.date)} · {slotName(reading.slot)}:{" "}
                {reading.value} mg/dl
              </title>
            </circle>
          </g>
        ))}
        {labels.map((index) => (
          <text
            key={index}
            x={x(index)}
            y={height - 2}
            textAnchor={
              index === 0
                ? "start"
                : index === readings.length - 1
                  ? "end"
                  : "middle"
            }
            fontSize="11"
            fill="#5d6c83"
          >
            {formatDate(readings[index].date, {
              day: "numeric",
              month: "short",
            })}
          </text>
        ))}
      </svg>
      <div
        className={`chart-detail ${selected ? "has-selection" : ""}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {selected ? (
          <>
            <span>
              {formatDate(selected.date)} · {slotName(selected.slot)}
            </span>
            <strong>
              {selected.value} <small>mg/dl</small>
            </strong>
          </>
        ) : (
          <span>
            Tap a point to see its reading. Use arrow keys when focused.
          </span>
        )}
      </div>
    </div>
  );
}
