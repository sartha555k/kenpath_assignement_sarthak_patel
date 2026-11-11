import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, shiftDate, today } from '../lib/dates.js';

export function DatePicker({ date, onChange }) {
  return <div className="date-controls">
    <button className="icon-button" aria-label="Previous day" onClick={() => onChange(shiftDate(date, -1))}><ChevronLeft size={16} /></button>
    <div className="date-input-wrap"><CalendarDays size={15} aria-hidden="true" /><span>{formatDate(date)}</span><input aria-label="Selected date" type="date" value={date} max={today()} onChange={(event) => { if (event.target.value && event.target.value <= today()) onChange(event.target.value); }} /></div>
    <button className="icon-button" aria-label="Next day" disabled={date >= today()} onClick={() => onChange(shiftDate(date, 1))}><ChevronRight size={16} /></button>
  </div>;
}
