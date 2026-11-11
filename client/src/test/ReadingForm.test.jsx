import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReadingForm } from '../components/ReadingForm.jsx';

const selectedDate = '2024-10-15';
async function complete(user, value = '125') {
  await user.selectOptions(screen.getByLabelText('Time slot'), 'after_lunch');
  if (value) await user.type(screen.getByLabelText('Glucose value'), value);
  await user.click(screen.getByRole('button', { name: 'Save reading' }));
}

describe('reading form', () => {
  it.each([['', 'Please enter a glucose value.'], ['39', 'between 40 and 600'], ['601', 'between 40 and 600'], ['100.5', 'whole number']])('rejects invalid glucose value %s', async (value, message) => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ReadingForm selectedDate={selectedDate} onSave={onSave} />);
    await complete(user, value);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('prevents duplicate slots and explains the conflict', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ReadingForm selectedDate={selectedDate} readings={[{ id: 1, slot: 'after_lunch', date: selectedDate, value: 100 }]} onSave={onSave} />);
    await complete(user);
    expect(screen.getByRole('alert')).toHaveTextContent('already have');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves integer values and displays server validation errors', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValueOnce(Object.assign(new Error('This slot was just recorded. Choose another.'), { field: 'slot' }));
    render(<ReadingForm selectedDate={selectedDate} onSave={onSave} />);
    await complete(user);
    expect(onSave).toHaveBeenCalledWith({ date: selectedDate, slot: 'after_lunch', value: 125 }, undefined);
    expect(await screen.findByRole('alert')).toHaveTextContent('This slot was just recorded');
    expect(screen.getByLabelText('Time slot')).toHaveAttribute('aria-invalid', 'true');
  });

  it('allows editing an existing slot without conflicting with itself', async () => {
    const user = userEvent.setup();
    const reading = { id: 1, date: selectedDate, slot: 'morning', value: 100 };
    const onSave = vi.fn().mockResolvedValueOnce(undefined);
    render(<ReadingForm selectedDate={selectedDate} readings={[reading]} editing={reading} onSave={onSave} />);
    await user.clear(screen.getByLabelText('Glucose value'));
    await user.type(screen.getByLabelText('Glucose value'), '110');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSave).toHaveBeenCalledWith({ date: selectedDate, slot: 'morning', value: 110 }, 1);
  });

  it('rejects future dates', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ReadingForm selectedDate="2099-01-01" onSave={onSave} />);
    await complete(user);
    expect(screen.getByRole('alert')).toHaveTextContent('Date cannot be in the future.');
    expect(onSave).not.toHaveBeenCalled();
  });
});
