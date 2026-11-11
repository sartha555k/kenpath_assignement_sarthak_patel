import { act, render, screen } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { WelcomeScreen, thoughts } from '../components/WelcomeScreen.jsx';

it('changes the motivational thought while waiting and on the next visit',()=>{
  vi.useFakeTimers();
  sessionStorage.removeItem('sweety-thought');
  const first=render(<WelcomeScreen/>);
  expect(screen.getByText(thoughts[0])).toBeInTheDocument();
  act(()=>vi.advanceTimersByTime(4500));
  expect(screen.getByText(thoughts[1])).toBeInTheDocument();
  first.unmount();
  render(<WelcomeScreen/>);
  expect(screen.getByText(thoughts[1])).toBeInTheDocument();
  vi.useRealTimers();
});
