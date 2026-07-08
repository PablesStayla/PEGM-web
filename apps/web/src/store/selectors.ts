import { useCartStore, useProductStore, useUIStore, useUserStore } from './index';

// Cart Selectors
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartTotal = () => useCartStore((state) => state.total);
export const useCartOpen = () => useCartStore((state) => state.isOpen);
export const useCartItemCount = () => useCartStore((state) => state.getItemCount());

export const useCartActions = () => {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const toggleCart = useCartStore((state) => state.toggleCart);

  return { addItem, removeItem, updateQuantity, clearCart, toggleCart };
};

export const useCartItemByProductId = (productId: string) =>
  useCartStore((state) => state.items.find((item) => item.product.id === productId));

export const useCartProductQuantity = (productId: string) =>
  useCartStore((state) => state.items.find((item) => item.product.id === productId)?.quantity ?? 0);

export const useIsInCart = (productId: string) =>
  useCartStore((state) => state.items.some((item) => item.product.id === productId));

// Product Selectors
export const useProducts = () => useProductStore((state) => state.products);
export const useFilteredProducts = () => useProductStore((state) => state.filteredProducts);
export const useProductsLoading = () => useProductStore((state) => state.loading);
export const useProductCategories = () => useProductStore((state) => state.categories);
export const useCurrentCategory = () => useProductStore((state) => state.currentCategory);
export const useSortBy = () => useProductStore((state) => state.sortBy);
export const useSearchQuery = () => useProductStore((state) => state.searchQuery);

export const useProductById = (id: string) =>
  useProductStore((state) => state.products.find((p) => p.id === id));

export const useProductActions = () => {
  const setProducts = useProductStore((state) => state.setProducts);
  const filterByCategory = useProductStore((state) => state.filterByCategory);
  const sortProducts = useProductStore((state) => state.sortProducts);
  const setSortBy = useProductStore((state) => state.setSortBy);
  const searchProducts = useProductStore((state) => state.searchProducts);
  const setLoading = useProductStore((state) => state.setLoading);

  return { setProducts, filterByCategory, sortProducts, setSortBy, searchProducts, setLoading };
};

// User Selectors
export const useUser = () => useUserStore((state) => state.user);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useUserAddresses = () => useUserStore((state) => state.user?.addresses ?? []);
export const useUserActions = () => {
  const setUser = useUserStore((state) => state.setUser);
  const logout = useUserStore((state) => state.logout);
  const updateUser = useUserStore((state) => state.updateUser);

  return { setUser, logout, updateUser };
};

// UI Selectors
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useTheme = () => useUIStore((state) => state.theme);
export const useNotifications = () => useUIStore((state) => state.notifications);
export const useUIActions = () => {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setTheme = useUIStore((state) => state.setTheme);
  const addNotification = useUIStore((state) => state.addNotification);
  const removeNotification = useUIStore((state) => state.removeNotification);

  return { toggleSidebar, setTheme, addNotification, removeNotification };
};
