import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { highlightDiff } from "@/components/TextDiffHighlight";
import { useNormalizedReviews } from "@/hooks/useNormalization";
import React from "react";
import BeforeAfterTextLoader from "@/components/loaders/BeforeAfterTextLoader";
import { CheckCircle2, Download, Loader2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompressedCSV } from "@/hooks/useDownloadPreviewCSV";
import { useToast } from "@/hooks/use-toast";
import { TechniqueBadgeSection } from "@/components/data-cleaning-step/TechniqueBadgeSection";

interface Badges {
  label: string;
  tip: string;
}

export default function NormalizationStep({
  fileId,
  description,
  badges,
  refetchStatus,
  isSample,
}: {
  fileId: string;
  description: string;
  badges: Badges[];
  refetchStatus: () => void;
  isSample: boolean;
}) {
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [inputMap, setInputMap] = useState("");
  const { toast } = useToast();
  const { data, isLoading, isApplying, applyBrokenMap } = useNormalizedReviews(
    fileId,
    page,
    pageSize
  );
  const { downloadDecompressed, isLoading: isDownloading } = useCompressedCSV(
    data ? data.normalized_s3_url : "",
    {
      enabled: false,
      filename: "normalized_reviews.csv",
    }
  );

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

    const { dismiss } = toast({
      title: "Please wait while we update the normalization.",
      description: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Applying changes...</span>
        </div>
      ),
      open: true,
    });

    try {
      await applyBrokenMap(map);

      dismiss();

      toast({
        title: "Normalization has been updated.",
        description: (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Broken map applied successfully</span>
          </div>
        ),
        duration: 4000,
      });

      await refetchStatus();
    } catch (err: any) {
      dismiss();
      toast({
        title: err?.message || "Something went wrong.",
        description: (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>Failed to apply changes</span>
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

      <div className="space-y-2 mb-4">
        <label className="text-xs text-muted-foreground font-medium">
          Broken Word Map (e.g., worng=wrong, becuse=because)
        </label>
        <Tooltip>
          <TooltipTrigger asChild>
            <input
              className="border px-3 py-1 rounded-md text-sm w-full"
              value={inputMap}
              onChange={(e) => setInputMap(e.target.value)}
              disabled={isSample}
            />
          </TooltipTrigger>
          {isSample && (
            <TooltipContent side="top">
              Editing is disabled for sample data
            </TooltipContent>
          )}
        </Tooltip>

        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="text-xs w-full flex-1"
                onClick={handleApply}
                disabled={isApplying || isSample}
              >
                {isApplying ? "Applying..." : "Apply Changes"}
              </Button>
            </TooltipTrigger>
            {isSample && (
              <TooltipContent side="top">
                Cannot apply changes to sample data
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
            <TooltipContent side="top">
              Download disabled for sample data
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

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
            {isApplying ? (
              <>
                {[...Array(10)].map((_, i) => (
                  <BeforeAfterTextLoader numberLoader={1} key={i} />
                ))}
              </>
            ) : (
              after.map((a, i) => (
                <div
                  key={i}
                  className="text-sm bg-white p-2 border border-solid rounded"
                >
                  {highlightDiff(before[i] || "", a)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
