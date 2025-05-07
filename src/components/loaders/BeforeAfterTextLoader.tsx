import React from "react";
import "@/styles/shimmer.css"; // Import shimmer styles

export default function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 rounded-xl p-5 h-80 overflow-y-auto border border-border shadow-sm animate-fade-in">
      {[...Array(2)].map((_, colIdx) => (
        <div key={colIdx}>
          <div className="h-4 w-24 bg-muted rounded mb-3 shimmer" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-muted shimmer h-6 rounded-md border border-dashed"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
