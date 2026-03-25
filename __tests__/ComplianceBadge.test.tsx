// ...existing code...
import { render, screen } from '@testing-library/react';
import { ComplianceBadge } from '../components/ComplianceBadge';

describe('ComplianceBadge', () => {
  it('renders the correct label for AA pass', () => {
    render(<ComplianceBadge ratio={4.5} level="AA" />);
    expect(screen.getByText(/AA Pass/i)).toBeInTheDocument();
  });

  it('renders the correct label for AAA Pass (Large)', () => {
    render(<ComplianceBadge ratio={5.0} level="AAA" />);
    expect(screen.getByText(/AAA Pass \(Large\)/i)).toBeInTheDocument();
  });
});
