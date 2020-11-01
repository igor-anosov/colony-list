import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders a list', () => {
    render(<App />);
    const listElement = screen.getByTestId(/list/i);
    expect(listElement).toBeInTheDocument();
  });
});

