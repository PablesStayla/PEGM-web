export function FooterSkeleton() {
  return (
    <footer
      className="w-full border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950"
      data-testid="footer-skeleton"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {/* Footer sections skeleton */}
        {Array.from({ length: 4 }).map((_, section) => (
          <div
            key={`footer-section-${section}`}
            className="space-y-4"
            data-testid="footer-skeleton-section"
          >
            {/* Section title skeleton */}
            <div className="animate-pulse h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded" />

            {/* Section links skeleton */}
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, link) => (
                <div
                  key={`footer-link-${section}-${link}`}
                  className="animate-pulse h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Copyright skeleton */}
      <div
        className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800"
        data-testid="footer-skeleton-bottom"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
        </div>
      </div>
    </footer>
  );
}
