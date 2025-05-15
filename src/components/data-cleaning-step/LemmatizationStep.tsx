import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Loader2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BeforeAfterTextLoader from "@/components/loaders/BeforeAfterTextLoader";
import { useLemmatization } from "@/hooks/useLemmatization";
import { useCompressedCSV } from "@/hooks/useDownloadPreviewCSV";
import { toast } from "@/hooks/use-toast";
import { TechniqueBadgeSection } from "@/components/data-cleaning-step/TechniqueBadgeSection";

interface BadgeItem {
  label: string;
  tip: string;
}

export default function LemmatizationStep({
  fileId,
  description,
  badges,
  refetchStatus,
  isSample,
}: {
  fileId: string;
  description: string;
  badges: BadgeItem[];
  refetchStatus: () => void;
  isSample;
}) {
  const pageSize = 20;
  const [page, setPage] = useState(1);

  const { data, isLoading, applyLemmatization, isApplying } = useLemmatization(
    fileId,
    page,
    pageSize
  );
  const { downloadDecompressed, isLoading: isDownloading } = useCompressedCSV(
    data?.lemmatized_s3_url || "",
    {
      enabled: false,
      filename: "lemmatized_reviews.csv",
    }
  );

  if (isLoading || !data) return <BeforeAfterTextLoader />;

  const { before, after, total, should_recompute } = data;
  const totalPages = Math.ceil(total / pageSize);

  const handleApply = async () => {
    const { dismiss } = toast({
      title: "Lemmatization in progress...",
      description: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please wait while we process the tokens.</span>
        </div>
      ),
      open: true,
    });

    try {
      await applyLemmatization();
      dismiss();

      toast({
        title: "Lemmatization complete",
        description: (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Tokens were successfully lemmatized.</span>
          </div>
        ),
        duration: 4000,
      });

      await refetchStatus();
    } catch (err: any) {
      console.error("❌ Lemmatization failed:", err);
      dismiss();
      toast({
        title: "Lemmatization failed",
        description: (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>{err?.message || "Unexpected error occurred."}</span>
          </div>
        ),
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  return (
    <>
      <span className="text-xs text-muted-foreground font-medium">
        Definitions
      </span>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {badges.length > 0 && (
        <TechniqueBadgeSection title="Techniques used:" badges={badges} />
      )}

      {/* Parameters */}
      <div className="mb-4 space-y-2">
        {should_recompute && (
          <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-300 p-3 rounded-md">
            ⚠️ The stopword-removed file has changed. Please regenerate to apply
            latest changes.
          </div>
        )}

        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  size="sm"
                  className="text-xs w-full"
                  onClick={handleApply}
                  disabled={isApplying || isSample}
                >
                  {isApplying ? "Lemmatizing..." : "Apply Lemmatization"}
                </Button>
              </div>
            </TooltipTrigger>
            {isSample && (
              <TooltipContent>
                This is sample data. You can't apply lemmatization here.
              </TooltipContent>
            )}
          </Tooltip>

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
          <h4 className="text-sm font-medium text-nlp-blue">After</h4>
          <div className="space-y-1">
            {isApplying ? (
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
