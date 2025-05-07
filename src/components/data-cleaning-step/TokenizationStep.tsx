import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CleaningBadgeSection } from "@/components/data-cleaning-step/CleaningBadgeSection";
import React from "react";
import BeforeAfterTextLoader from "@/components/loaders/BeforeAfterTextLoader";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download } from "lucide-react";
import { useTokenizedReviews } from "@/hooks/useTokenization";
import { useDownloadToast } from "@/hooks/useDownloadToast";

interface BadgeItem {
  label: string;
  tip: string;
}

export default function TokenizationStep({
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

  const { data, isLoading, regenerate, isRegenerating } =
    useTokenizedReviews(fileId, page, pageSize);
  const { downloadFile } = useDownloadToast();

  if (isLoading || !data) {
    return <BeforeAfterTextLoader />;
  }

  const { before, after, total, should_recompute, tokenized_s3_url } = data;
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

      {/* Recompute button if needed */}

      <div className="mb-4 space-y-2">
        {should_recompute && (
          <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-300 p-3 rounded-md">
            ⚠️ You made changes in a previous cleaning step. Please regenerate
            tokenization to reflect the latest cleaned data.
          </div>
        )}
        <div
          className={`flex ${
            should_recompute ? "justify-between gap-1" : "justify-end"
          }`}
        >
          {should_recompute && (
            <Button
              size="sm"
              className="text-xs w-full"
              onClick={() => regenerate()}
              disabled={isRegenerating}
            >
              {isRegenerating ? "Regenerating..." : "Recompute Tokenization"}
            </Button>
          )}

          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    downloadFile(tokenized_s3_url, {
                      filename: "tokenized_reviews.csv",
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
      </div>

      {/* Token display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 rounded-xl p-5 h-80 overflow-y-auto border border-border shadow-sm">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            Original
          </h4>
          <div className="space-y-1">
            {before.map((b: string, i: number) => (
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
          <h4 className="text-sm font-medium text-nlp-blue">Tokens</h4>
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
    </React.Fragment>
  );
}
