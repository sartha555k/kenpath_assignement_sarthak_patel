import { useId } from 'react';
import { formatDate, slotName } from '../lib/dates.js';

export function TrendChart({ readings = [] }) {
  const chartId = useId();
  if (!readings.length) return <div className="chart-empty"><p>Your month starts with a reading.</p><span>Add a reading to see your glucose history here.</span></div>;
  const values = readings.map((reading) => reading.value);
  const low = Math.max(0, Math.floor((Math.min(...values) - 20) / 20) * 20);
  const high = Math.ceil((Math.max(...values) + 20) / 20) * 20;
  const width = 650;
  const height = 180;
  const x = (index) => 45 + (readings.length === 1 ? (width - 65) / 2 : index / (readings.length - 1) * (width - 65));
  const y = (value) => 18 + (high - value) / (high - low) * (height - 50);
  const points = readings.map((reading, index) => `${x(index)},${y(reading.value)}`).join(' ');
  const ticks = [high, (high + low) / 2, low];
  const labels = [...new Set([0, Math.floor((readings.length - 1) / 2), readings.length - 1])];
  return <div className="trend-chart"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={chartId}><title id={chartId}>Glucose readings this month, ranging from {Math.min(...values)} to {Math.max(...values)} mg/dl. Exact readings are available in Reading history.</title>
    {ticks.map((tick) => <g key={tick}><line x1="45" y1={y(tick)} x2={width - 20} y2={y(tick)} stroke="#e5e9df" strokeDasharray="3 5" /><text x="0" y={y(tick) + 4} fill="#626d60" fontSize="11">{tick}</text></g>)}
    <polyline fill="none" stroke="#7c9354" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={points} />
    {readings.map((reading, index) => <circle key={reading.id} cx={x(index)} cy={y(reading.value)} r="3.5" fill="#455638" stroke="white" strokeWidth="1.5"><title>{formatDate(reading.date)} · {slotName(reading.slot)}: {reading.value} mg/dl</title></circle>)}
    {labels.map((index) => <text key={index} x={x(index)} y={height - 2} textAnchor={index === 0 ? 'start' : index === readings.length - 1 ? 'end' : 'middle'} fontSize="11" fill="#626d60">{formatDate(readings[index].date, { day: 'numeric', month: 'short' })}</text>)}
  </svg></div>;
}
