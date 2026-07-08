import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('should render with positive trend', () => {
    render(<KpiCard title="Total Revenue" value="$12,500" change={15.5} icon="TrendingUp" />);

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$12,500')).toBeInTheDocument();
    expect(screen.getByText(/\+15\.5/)).toBeInTheDocument();
  });

  it('should render with negative trend', () => {
    render(
      <KpiCard title="Pending Orders" value="23" change={-8.2} icon="TrendingUp" trend="down" />,
    );

    expect(screen.getByText('Pending Orders')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText(/-8\.2/)).toBeInTheDocument();
  });

  it('should render with zero change', () => {
    render(<KpiCard title="Total Users" value="1,234" change={0} icon="Users" />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText(/0\.0/)).toBeInTheDocument();
  });

  it('should render icon', () => {
    const { container } = render(<KpiCard title="Test" value="100" change={5} icon="TrendingUp" />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should apply correct trend color for positive change', () => {
    render(<KpiCard title="Test" value="100" change={10} icon="TrendingUp" />);

    const changeText = screen.getByText(/\+10\.0/);
    expect(changeText).toHaveClass('text-prana-emerald');
  });

  it('should apply correct trend color for negative change', () => {
    render(<KpiCard title="Test" value="100" change={-5} icon="TrendingUp" trend="down" />);

    const changeText = screen.getByText(/-5\.0/);
    expect(changeText).toHaveClass('text-red-400');
  });

  it('should apply correct trend color for zero change', () => {
    render(<KpiCard title="Test" value="100" change={0} icon="TrendingUp" trend="neutral" />);

    const changeText = screen.getByText(/0\.0/);
    expect(changeText).toHaveClass('text-white/40');
  });

  it('should format change with one decimal place', () => {
    render(<KpiCard title="Test" value="100" change={12.567} icon="TrendingUp" />);

    expect(screen.getByText(/\+12\.6/)).toBeInTheDocument();
  });
});
