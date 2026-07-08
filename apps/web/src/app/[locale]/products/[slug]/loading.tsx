export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image skeleton */}
        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl" />

        {/* Details skeleton */}
        <div className="space-y-6">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
