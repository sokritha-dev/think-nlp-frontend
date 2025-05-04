import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { highlightDiff } from "@/components/TextDiffHighlight";
import { useSpecialRemovalReviews } from "@/hooks/useSpecialRemoval";
import { CleaningBadgeSection } from "@/components/data-cleaning-step/CleaningBadgeSection";
import React from "react";
import BeforeAfterTextLoader from "@/components/loaders/BeforeAterTextLoader";

interface Badges {
  label: string;
  tip: string;
}

export default function SpecialCharRemovalStep({
  fileId,
  description,
  badges,
}: {
  fileId: string;
  description: string;
  badges: Badges[];
}) {
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [flags, setFlags] = useState({
    remove_special: true,
    remove_numbers: true,
    remove_emoji: true,
  });

  const { data, isLoading, isApplying, applySpecialClean } =
    useSpecialRemovalReviews(fileId, page, pageSize);

  const handleApply = async () => {
    await applySpecialClean({ ...flags, file_id: fileId });
  };

  if (isLoading || !data) {
    return <BeforeAfterTextLoader />;
  }

  const { before, after, total } = data;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <React.Fragment>
      <span className="text-xs text-muted-foreground font-medium">
        Definitions
      </span>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {badges.length > 0 && (
        <CleaningBadgeSection title="Techniques used:" badges={badges} />
      )}

      {/* =============== Parameters ================ */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-4">
          {["remove_special", "remove_numbers", "remove_emoji"].map((key) => (
            <label className="text-sm" key={key}>
              <input
                type="checkbox"
                checked={flags[key as keyof typeof flags]}
                onChange={() =>
                  setFlags((f) => ({
                    ...f,
                    [key]: !f[key as keyof typeof flags],
                  }))
                }
              />{" "}
              {key.replace("remove_", "Remove ")}
            </label>
          ))}
        </div>
        <Button
          size="sm"
          className="text-xs w-full"
          onClick={handleApply}
          disabled={isApplying}
        >
          {isApplying ? "Applying..." : "Apply Cleaning"}
        </Button>
      </div>

      {/* =============== Input & Output Text ================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 rounded-xl p-5 h-80 overflow-y-auto border border-border shadow-sm">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Before</h4>
          <div className="space-y-1">
            {before.map((b, i) => (
              <div
                key={i}
                className="text-sm bg-white/50 p-2 border border-dashed rounded"
              >
                {b}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-nlp-blue">After</h4>
          <div className="space-y-1">
            {after.map((a, i) => (
              <div
                key={i}
                className="text-sm bg-white p-2 border border-solid rounded"
              >
                {highlightDiff(before[i] || "", a)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =============== Pagination ================ */}
      <div className="w-full flex justify-between items-center mt-4">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ◀️ Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next ▶️
        </Button>
      </div>
    </React.Fragment>
  );
}
