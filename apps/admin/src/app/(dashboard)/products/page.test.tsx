import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as actions from '@/actions/admin-products';
import AdminProductsPage from './page';

// Mock the server action
vi.mock('@/actions/admin-products', () => ({
  getAdminProducts: vi.fn(),
}));

vi.mock('@/resources/catalog/ProductsFilters', () => ({
  ProductsFilters: () => <div data-testid="products-filters" />,
}));

vi.mock('@/resources/catalog/ProductsTable', () => ({
  ProductsTable: () => <div data-testid="products-table" />,
}));

vi.mock('@/components/shared/TablePagination', () => ({
  TablePagination: () => <div data-testid="table-pagination" />,
}));

describe('AdminProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render stats correctly based on fetched data', async () => {
    // Arrange
    const mockProducts = [
      { id: '1', name: 'Product 1', stockQuantity: 15, isFeatured: true },
      { id: '2', name: 'Product 2', stockQuantity: 5, isFeatured: true },
      { id: '3', name: 'Product 3', stockQuantity: 20, isFeatured: false },
    ];

    (actions.getAdminProducts as vi.Mock).mockResolvedValue({
      data: {
        success: true,
        data: mockProducts,
        pagination: {
          page: 1,
          pageSize: 20,
          total: 3,
          totalPages: 1,
        },
      },
    });

    const searchParams = Promise.resolve({});

    // Act
    // @ts-expect-error - We are rendering an async component, which is fine in tests
    const { findByText } = render(await AdminProductsPage({ searchParams }));

    // Assert
    // Check total products
    expect((await screen.findAllByText('3')).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Total Productos')).toBeInTheDocument();

    // Check active products (this mock doesn't distinguish, so it's same as total)
    // In a real scenario, you'd mock active status properly
    expect((await screen.findAllByText('3')).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Activos')).toBeInTheDocument();

    // Check total stock
    expect(await findByText('40')).toBeInTheDocument(); // 15 + 5 + 20
    expect(screen.getByText('Stock Total')).toBeInTheDocument();

    // Check low stock count
    expect(await findByText('1')).toBeInTheDocument(); // Only product 2 has stock < 10
    expect(screen.getByText('Stock Bajo (<10)')).toBeInTheDocument();
  });

  it('should render an error message when data fetching fails', async () => {
    // Arrange
    (actions.getAdminProducts as vi.Mock).mockResolvedValue({
      data: {
        success: false,
      },
      serverError: 'Database connection failed',
    });

    const searchParams = Promise.resolve({});

    // Act
    // @ts-expect-error
    const { findByText } = render(await AdminProductsPage({ searchParams }));

    // Assert
    expect(await findByText('Error al cargar productos')).toBeInTheDocument();
    expect(await findByText('Database connection failed')).toBeInTheDocument();
  });
});
