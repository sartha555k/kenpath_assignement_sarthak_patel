import { ChevronLeft, ChevronRight } from 'lucide-react';
import { shiftDate, today } from '../lib/dates.js';
import { DateField } from './DateField.jsx';
export function DatePicker({date,onChange}) {
  return <div className="date-controls"><button className="icon-button" aria-label="Previous day" onClick={()=>onChange(shiftDate(date,-1))}><ChevronLeft size={16}/></button>
    <DateField value={date} onChange={onChange} label="Selected date" compact />
    <button className="icon-button" aria-label="Next day" disabled={date>=today()} onClick={()=>onChange(shiftDate(date,1))}><ChevronRight size={16}/></button>
  </div>;
}
