import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TopProductsTable } from './TopProductsTable';

const mockProducts = [
  {
    id: '1',
    name: 'Product A',
    category: 'Electronics',
    revenue: 5000,
    unitsSold: 50,
  },
  {
    id: '2',
    name: 'Product B',
    category: 'Clothing',
    revenue: 3000,
    unitsSold: 100,
  },
  {
    id: '3',
    name: 'Product C',
    category: 'Books',
    revenue: 2000,
    unitsSold: 200,
  },
];

describe('TopProductsTable', () => {
  it('should render table headers', () => {
    render(<TopProductsTable products={mockProducts} />);

    expect(screen.getByText('Posicion & Producto')).toBeInTheDocument();
    expect(screen.getByText('Categoria')).toBeInTheDocument();
    expect(screen.getByText('Volumen')).toBeInTheDocument();
    expect(screen.getByText('Rendimiento (USD)')).toBeInTheDocument();
  });

  it('should render all products', () => {
    render(<TopProductsTable products={mockProducts} />);

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.getByText('Product C')).toBeInTheDocument();
  });

  it('should render product categories', () => {
    render(<TopProductsTable products={mockProducts} />);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
  });

  it('should format revenue as currency', () => {
    render(<TopProductsTable products={mockProducts} />);

    // Check for the revenue values (regex to be safe with currency formatting)
    expect(screen.getByText(/\$5[.,]000/)).toBeInTheDocument();
    expect(screen.getByText(/\$3[.,]000/)).toBeInTheDocument();
  });

  it('should display units sold', () => {
    render(<TopProductsTable products={mockProducts} />);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('should handle empty products array', () => {
    render(<TopProductsTable products={[]} />);

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
