import { AppError } from './errors.js';

export const SLOTS = {
  morning: 'Morning (fasting)',
  after_breakfast: 'After breakfast',
  after_lunch: 'After lunch',
  after_dinner: 'After dinner',
};

export function today(timezone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function validateDate(value, timezone) {
  if (typeof value !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(400, 'Please enter a valid date in YYYY-MM-DD format.', 'date');
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new AppError(400, 'Please enter a valid calendar date.', 'date');
  }
  if (value > today(timezone)) throw new AppError(400, 'Date cannot be in the future.', 'date');
  return value;
}

export function validateReading(body, timezone) {
  const { date, slot, value } = body || {};
  validateDate(date, timezone);
  if (typeof slot !== 'string' || !Object.hasOwn(SLOTS, slot)) {
    throw new AppError(400, 'Please select one of the four reading slots.', 'slot');
  }
  if (value === undefined || value === null || value === '') throw new AppError(400, 'Please enter a glucose value.', 'value');
  if (!Number.isInteger(value) || value < 40 || value > 600) {
    throw new AppError(400, 'Value must be a whole number between 40 and 600 mg/dl.', 'value');
  }
  return { date, slot, value };
}

export function positiveInteger(value, field, maximum = 2147483647) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || Number(value) > maximum) {
    throw new AppError(400, `${field} must be a positive integer no greater than ${maximum}.`, field);
  }
  return Number(value);
}
