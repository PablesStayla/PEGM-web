export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg mb-4" />
            <div className="bg-gray-200 h-4 w-3/4 rounded mb-2" />
            <div className="bg-gray-200 h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
