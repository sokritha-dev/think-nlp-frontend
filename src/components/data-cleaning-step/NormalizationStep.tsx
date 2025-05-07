import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { highlightDiff } from "@/components/TextDiffHighlight";
import { useNormalizedReviews } from "@/hooks/useNormalization";
import { CleaningBadgeSection } from "@/components/data-cleaning-step/CleaningBadgeSection";
import React from "react";
import BeforeAfterTextLoader from "@/components/loaders/BeforeAfterTextLoader";
import { Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDownloadToast } from "@/hooks/useDownloadToast";

interface Badges {
  label: string;
  tip: string;
}

export default function NormalizationStep({
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
  const [inputMap, setInputMap] = useState("");
  const { data, isLoading, isApplying, applyBrokenMap } =
    useNormalizedReviews(fileId, page, pageSize);
  const { downloadFile } = useDownloadToast();

  useEffect(() => {
    if (data?.broken_words) {
      const formatted = Object.entries(data.broken_words)
        .map(([key, value]) => `${key}=${value}`)
        .join(", ");
      setInputMap(formatted);
    }
  }, [data?.broken_words]);

  if (isLoading || !data) {
    return <BeforeAfterTextLoader />;
  }

  const { before, after, total } = data;
  const totalPages = Math.ceil(total / pageSize);

  const handleApply = async () => {
    const map: Record<string, string> = {};
    inputMap.split(",").forEach((pair) => {
      const [k, v] = pair.split("=").map((s) => s.trim());
      if (k && v) map[k] = v;
    });
    await applyBrokenMap(map);
  };

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
        <label className="text-xs text-muted-foreground font-medium">
          Broken Word Map (e.g., worng=wrong, becuse=because)
        </label>
        <input
          className="border px-3 py-1 rounded-md text-sm w-full"
          value={inputMap}
          onChange={(e) => setInputMap(e.target.value)}
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            className="text-xs w-full flex-1"
            onClick={handleApply}
            disabled={isApplying}
          >
            {isApplying ? "Applying..." : "Apply Changes"}
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  downloadFile(data.normalized_s3_url, {
                    filename: "normalized_reviews.csv",
                    mimeType: "text/csv;charset=utf-8;",
                  })
                }
              >
                <Download className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as CSV</TooltipContent>
          </Tooltip>
        </div>
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
