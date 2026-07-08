/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FooterSkeleton } from './Skeleton/Footerskeleton';
import { HeaderSkeleton } from './Skeleton/Headerskeleton';
import { ProductCardSkeleton } from './Skeleton/ProductCardskeleton';
import { ProductGridSkeleton } from './Skeleton/ProductGridskeleton';

describe('Skeleton Components - Enterprise Level', () => {
  describe('HeaderSkeleton', () => {
    it('renders logo, navigation, and action placeholders', () => {
      render(<HeaderSkeleton />);

      expect(screen.getByTestId('header-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('header-skeleton-logo')).toBeInTheDocument();
      expect(screen.getAllByTestId('header-skeleton-nav-item')).toHaveLength(4);
      expect(screen.getAllByTestId('header-skeleton-action')).toHaveLength(2);
    });
  });

  describe('FooterSkeleton', () => {
    it('renders column placeholders and bottom section', () => {
      render(<FooterSkeleton />);

      expect(screen.getByTestId('footer-skeleton')).toBeInTheDocument();
      expect(screen.getAllByTestId('footer-skeleton-section').length).toBeGreaterThan(0);
      expect(screen.getByTestId('footer-skeleton-bottom')).toBeInTheDocument();
    });
  });

  describe('ProductCardSkeleton', () => {
    it('renders card structure with image and text placeholders', () => {
      render(<ProductCardSkeleton />);

      expect(screen.getByTestId('product-card-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-skeleton-image')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-skeleton-title')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-skeleton-price')).toBeInTheDocument();
    });
  });

  describe('ProductGridSkeleton', () => {
    it('renders grid of product card placeholders', () => {
      render(<ProductGridSkeleton />);

      const grid = screen.getByTestId('product-grid-skeleton');
      expect(grid).toBeInTheDocument();
      expect(screen.getAllByTestId('product-card-skeleton').length).toBeGreaterThan(0);
    });
  });
});
