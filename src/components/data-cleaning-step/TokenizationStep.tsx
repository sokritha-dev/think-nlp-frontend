import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import React from "react";
import BeforeAfterTextLoader from "@/components/loaders/BeforeAfterTextLoader";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, Download, Loader2, XCircle } from "lucide-react";
import { useTokenizedReviews } from "@/hooks/useTokenization";
import { useCompressedCSV } from "@/hooks/useDownloadPreviewCSV";
import { useToast } from "@/hooks/use-toast";
import { TechniqueBadgeSection } from "@/components/data-cleaning-step/TechniqueBadgeSection";

interface BadgeItem {
  label: string;
  tip: string;
}

export default function TokenizationStep({
  fileId,
  description,
  badges,
  refetchStatus,
}: {
  fileId: string;
  description: string;
  badges: BadgeItem[];
  refetchStatus: () => void;
}) {
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading, regenerate, isRegenerating } = useTokenizedReviews(
    fileId,
    page,
    pageSize
  );

  const { downloadDecompressed, isLoading: isDownloading } = useCompressedCSV(
    data ? data.tokenized_s3_url : "",
    {
      enabled: false,
      filename: "tokenized_reviews.csv",
    }
  );

  if (isLoading || !data) {
    return <BeforeAfterTextLoader />;
  }

  const { before, after, total, should_recompute } = data;
  const totalPages = Math.ceil(total / pageSize);

  const handleRegenerate = async () => {
    const { dismiss } = toast({
      title: "Regenerating tokenization...",
      description: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please wait while we recompute the tokens.</span>
        </div>
      ),
      open: true,
    });

    try {
      await regenerate();

      dismiss();

      toast({
        title: "Tokenization updated",
        description: (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>New tokens successfully generated!</span>
          </div>
        ),
        duration: 4000,
      });

      await refetchStatus();
    } catch (err: any) {
      console.error("❌ Tokenization failed:", err);
      dismiss();
      toast({
        title: "Tokenization failed",
        description: (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>
              {err?.message || "Something went wrong while recomputing."}
            </span>
          </div>
        ),
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  return (
    <React.Fragment>
      <span className="text-xs text-muted-foreground font-medium">
        Definitions
      </span>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {badges.length > 0 && (
        <TechniqueBadgeSection title="Techniques used:" badges={badges} />
      )}

      {/* =============== Parameters ================ */}
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
              disabled={isRegenerating}
              onClick={handleRegenerate}
            >
              {isRegenerating ? "Regenerating..." : "Recompute Tokenization"}
            </Button>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={downloadDecompressed}
                disabled={isDownloading}
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
          <h4 className="text-sm font-medium text-nlp-blue">After</h4>
          <div className="space-y-1">
            {isRegenerating ? (
              <>
                {[...Array(10)].map((_, i) => (
                  <BeforeAfterTextLoader numberLoader={1} key={i} />
                ))}
              </>
            ) : (
              after.map((tokens: string[], i: number) => (
                <div
                  key={i}
                  className="text-sm bg-white p-2 border border-solid rounded"
                >
                  {tokens.join(" | ")}
                </div>
              ))
            )}
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
