import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CleaningBadgeSection } from "@/components/data-cleaning-step/CleaningBadgeSection";
import BeforeAfterTextLoader from "@/components/loaders/BeforeAfterTextLoader";
import { useLemmatization } from "@/hooks/useLemmatization";
import { useDownloadToast } from "@/hooks/useDownloadToast";

interface BadgeItem {
  label: string;
  tip: string;
}

export default function LemmatizationStep({
  fileId,
  description,
  badges,
}: {
  fileId: string;
  description: string;
  badges: BadgeItem[];
}) {
  const pageSize = 20;
  const [page, setPage] = useState(1);

  const { data, isLoading, applyLemmatization, isApplying } = useLemmatization(
    fileId,
    page,
    pageSize
  );
  const { downloadFile } = useDownloadToast();

  if (isLoading || !data) return <BeforeAfterTextLoader />;

  const { before, after, total, lemmatized_s3_url, should_recompute } = data;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <span className="text-xs text-muted-foreground font-medium">
        Definitions
      </span>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {badges.length > 0 && (
        <CleaningBadgeSection title="Techniques used:" badges={badges} />
      )}

      <div className="mb-4 space-y-2">
        {should_recompute && (
          <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-300 p-3 rounded-md">
            ⚠️ The stopword-removed file has changed. Please regenerate to apply
            latest changes.
          </div>
        )}
        <div className="flex justify-between gap-1">
          <Button
            size="sm"
            className="text-xs w-full"
            onClick={() => applyLemmatization()}
            disabled={isApplying}
          >
            {isApplying ? "Lemmatizing..." : "Apply Lemmatization"}
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  downloadFile(lemmatized_s3_url, {
                    filename: "lemmatized_reviews.csv",
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

      {/* Before / After Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 rounded-xl p-5 h-80 overflow-y-auto border border-border shadow-sm">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Before</h4>
          <div className="space-y-1">
            {before.map((tokens: string[], i: number) => (
              <div
                key={i}
                className="text-sm bg-white/50 p-2 border border-dashed rounded"
              >
                {tokens.join(" | ")}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-nlp-blue">Lemmatized</h4>
          <div className="space-y-1">
            {after.map((tokens: string[], i: number) => (
              <div
                key={i}
                className="text-sm bg-white p-2 border border-solid rounded"
              >
                {tokens.join(" | ")}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
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
    </>
  );
}
