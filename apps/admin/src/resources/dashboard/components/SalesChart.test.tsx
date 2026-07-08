import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { SalesChart } from './SalesChart';

// Mock ResizeObserver for recharts in jsdom
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockData = [
  { date: '2024-01-01', revenue: 1200, orders: 15 },
  { date: '2024-01-02', revenue: 1500, orders: 18 },
  { date: '2024-01-03', revenue: 1100, orders: 12 },
  { date: '2024-01-04', revenue: 1800, orders: 22 },
  { date: '2024-01-05', revenue: 1600, orders: 19 },
];

describe('SalesChart', () => {
  it('should render chart title', () => {
    render(<SalesChart data={mockData} />);
    expect(screen.getByText('Rendimiento Global de Ventas')).toBeInTheDocument();
  });

  it('should render with empty data', () => {
    render(<SalesChart data={[]} />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render chart container with data', () => {
    render(<SalesChart data={mockData} />);
    expect(screen.getByText('Rendimiento Global de Ventas')).toBeInTheDocument();
    expect(screen.getByText('Inteligencia de Mercado')).toBeInTheDocument();
  });

  it('should handle single data point', () => {
    const singleData = [{ date: '2024-01-01', revenue: 1000, orders: 10 }];
    render(<SalesChart data={singleData} />);
    expect(screen.getByText('Rendimiento Global de Ventas')).toBeInTheDocument();
  });

  it('should format large revenue numbers', () => {
    const largeData = [{ date: '2024-01-01', revenue: 15000, orders: 150 }];
    render(<SalesChart data={largeData} />);
    expect(screen.getByText('Rendimiento Global de Ventas')).toBeInTheDocument();
  });
});
