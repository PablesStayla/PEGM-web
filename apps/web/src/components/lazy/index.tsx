/**
 * Lazy-loaded components using Next.js dynamic()
 * These components are code-split and loaded only when needed
 * Reduces initial bundle size and improves First Contentful Paint
 */

import dynamic from 'next/dynamic';

// Loading fallback for heavy components
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
  </div>
);

// ==================== MODALS & DRAWERS ====================

/**
 * QuickViewModal - Product quick view modal
 * ~15KB - Only loaded when user clicks "Quick View"
 */
export const QuickViewModal = dynamic(
  () => import('../product/QuickViewModal').then((mod) => ({ default: mod.QuickViewModal })),
  {
    loading: () => <LoadingFallback />,
    ssr: false, // Modal doesn't need SSR
  },
);

/**
 * ComparisonDrawer - Product comparison drawer
 * ~20KB - Only loaded when user opens comparison
 */
export const ComparisonDrawer = dynamic(
  () => import('../comparison/ComparisonDrawer').then((mod) => ({ default: mod.ComparisonDrawer })),
  {
    loading: () => <LoadingFallback />,
    ssr: false,
  },
);

/**
 * ShareModal - Social sharing modal
 * ~10KB - Only loaded when user clicks share
 */
export const ShareModal = dynamic(
  () => import('../product/ShareModal').then((mod) => ({ default: mod.ShareModal })),
  {
    loading: () => <LoadingFallback />,
    ssr: false,
  },
);

// ==================== CHAT & AI ====================

/**
 * AiChat - AI chatbot widget
 * ~50KB - Heavy component, load only when needed
 */
export const AiChat = dynamic(
  () => import('../chat/AiChat').then((mod) => ({ default: mod.AiChat })),
  {
    loading: () => <LoadingFallback />,
    ssr: false,
  },
);

/**
 * AiRecommendations - AI-powered product recommendations
 * ~30KB - Load after initial render
 */
export const AiRecommendations = dynamic(
  () =>
    import('../recommendations/AiRecommendations').then((mod) => ({
      default: mod.AiRecommendations,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

// ==================== PRODUCT FEATURES ====================

/**
 * Product360Viewer - 360° product viewer
 * ~40KB - Heavy interactive component
 */
export const Product360Viewer = dynamic(
  () => import('../product/Product360Viewer').then((mod) => ({ default: mod.Product360Viewer })),
  {
    loading: () => <LoadingFallback />,
    ssr: false,
  },
);

/**
 * ReviewForm - Review submission form
 * ~15KB - Only loaded when user wants to write review
 */
export const ReviewForm = dynamic(
  () => import('../reviews/ReviewForm').then((mod) => ({ default: mod.ReviewForm })),
  {
    loading: () => <LoadingFallback />,
    ssr: false,
  },
);

/**
 * ReviewsList - Product reviews list
 * ~25KB - Can be loaded after main product content
 */
export const ReviewsList = dynamic(
  () => import('../reviews/ReviewsList').then((mod) => ({ default: mod.ReviewsList })),
  {
    loading: () => <LoadingFallback />,
  },
);

// ==================== ADVANCED FEATURES ====================

/**
 * ReferralSystem - Referral program widget
 * ~20KB - Non-critical feature
 */
export const ReferralSystem = dynamic(
  () => import('../referral/ReferralSystem').then((mod) => ({ default: mod.ReferralSystem })),
  {
    loading: () => <LoadingFallback />,
    ssr: false,
  },
);

/**
 * NotificationCenter - Notification center panel
 * ~15KB - Load on demand
 */
export const NotificationCenter = dynamic(
  () =>
    import('../notifications/NotificationCenter').then((mod) => ({
      default: mod.NotificationCenter,
    })),
  {
    loading: () => <LoadingFallback />,
    ssr: false,
  },
);

// ==================== EXPORT ALL ====================

/**
 * Usage:
 *
 * Instead of:
 * import { QuickViewModal } from '@/components/product/QuickViewModal'
 *
 * Use:
 * import { QuickViewModal } from '@/components/lazy'
 *
 * Benefits:
 * - Smaller initial bundle
 * - Faster First Contentful Paint
 * - Better Lighthouse scores
 * - Improved user experience on slow connections
 */
