// ...existing code...
import { render, screen } from '@testing-library/react';
import { LandingPage } from '../components/LandingPage';

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage onLaunch={() => {}} />);
    expect(screen.getByRole('heading', { name: /Design for Everyone/i })).toBeInTheDocument();
  });
});
