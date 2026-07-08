export function HeaderSkeleton() {
  return (
    <header
      className="fixed top-0 z-40 w-full bg-white shadow-sm dark:bg-gray-950"
      data-testid="header-skeleton"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Skeleton */}
        <div
          className="animate-pulse h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded"
          data-testid="header-skeleton-logo"
        />

        {/* Navigation Skeleton */}
        <nav className="hidden md:flex items-center space-x-8" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"
              data-testid="header-skeleton-nav-item"
            />
          ))}
        </nav>

        {/* Actions Skeleton */}
        <div className="flex items-center space-x-4">
          <div
            className="animate-pulse h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full"
            data-testid="header-skeleton-action"
          />
          <div
            className="animate-pulse h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full"
            data-testid="header-skeleton-action"
          />
        </div>
      </div>
    </header>
  );
}
