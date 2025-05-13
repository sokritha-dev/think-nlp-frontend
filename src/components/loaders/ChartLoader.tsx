// components/loaders/ChartLoader.tsx
export default function ChartLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-[360px] border border-dashed rounded-md bg-muted animate-pulse">
      <div className="h-6 w-32 bg-gray-300 rounded mb-4" />
      <div className="w-full max-w-md">
        <div className="h-4 bg-gray-300 rounded mb-2" />
        <div className="h-4 bg-gray-300 rounded w-5/6 mb-2" />
        <div className="h-4 bg-gray-300 rounded w-4/6 mb-2" />
        <div className="h-4 bg-gray-300 rounded w-3/6 mb-2" />
      </div>
    </div>
  );
}
