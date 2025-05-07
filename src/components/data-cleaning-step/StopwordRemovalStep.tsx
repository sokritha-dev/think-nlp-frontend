import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CleaningBadgeSection } from "@/components/data-cleaning-step/CleaningBadgeSection";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download } from "lucide-react";
import { useStopwordRemoval } from "@/hooks/useStopwordRemoval";
import BeforeAfterTextLoader from "@/components/loaders/BeforeAfterTextLoader";
import { useToast } from "@/components/ui/use-toast";
import { useDownloadToast } from "@/hooks/useDownloadToast";

interface BadgeItem {
  label: string;
  tip: string;
}

export default function StopwordRemovalStep({
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
  const { toast } = useToast();

  const [customStopwords, setCustomStopwords] = useState("");
  const [excludeStopwords, setExcludeStopwords] = useState("");

  const generateConfigs = (
    customStopwords: string,
    excludeStopwords: string
  ) => {
    const customStopwordList = customStopwords.split(",").map((s) => s.trim());
    const excludeStopwordList = excludeStopwords
      .split(",")
      .map((s) => s.trim());

    return {
      custom_stopwords: customStopwordList,
      exclude_stopwords: excludeStopwordList,
    };
  };

  const stopwordConfigs = useMemo(
    () => generateConfigs(customStopwords, excludeStopwords),
    [customStopwords, excludeStopwords]
  );

  const { data, isLoading, applyStopwordRemoval, isApplying } =
    useStopwordRemoval(fileId, page, pageSize, stopwordConfigs);
  const { downloadFile } = useDownloadToast();

  useEffect(() => {
    if (data?.config) {
      const customStopwordString = config.custom_stopwords.toString();
      const excludeStopwordString = config.exclude_stopwords.toString();

      setCustomStopwords(customStopwordString);
      setExcludeStopwords(excludeStopwordString);
    }
  }, [data?.config]);

  if (isLoading || !data) return <BeforeAfterTextLoader />;

  const { before, after, total, should_recompute, stopword_s3_url, config } =
    data;

  const totalPages = Math.ceil(total / pageSize);

  const handleApply = async () => {
    try {
      await applyStopwordRemoval();
      toast({
        title: "Stopword Removal Applied",
        description:
          "The stopwords were successfully removed from your tokens.",
      });
    } catch (error) {
      toast({
        title: "Stopword Removal Error",
        description: `There is an issue during removal stopword: ${error}`,
        variant: "destructive",
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
        <CleaningBadgeSection title="Techniques used:" badges={badges} />
      )}

      {/* Warning and Actions */}
      <div className="mb-4 space-y-2">
        {should_recompute && (
          <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-300 p-3 rounded-md">
            ⚠️ You made changes in a previous step or config. Please regenerate
            to reflect the latest data.
          </div>
        )}

        <div className="flex flex-col gap-2 ">
          <div className="w-full">
            <label className="text-xs text-muted-foreground font-medium block mb-1">
              Custom Stopwords (comma-separated)
            </label>
            <input
              className="border px-3 py-1 rounded-md text-sm w-full"
              placeholder="e.g., room,hotel,staff"
              value={customStopwords}
              onChange={(e) => setCustomStopwords(e.target.value)}
            />
          </div>

          <div className="w-full">
            <label className="text-xs text-muted-foreground font-medium block mb-1">
              Exclude from NLTK Stopwords
            </label>
            <input
              className="border px-3 py-1 rounded-md text-sm w-full"
              placeholder="e.g., not,no,very"
              value={excludeStopwords}
              onChange={(e) => setExcludeStopwords(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              NLTK's default English stopwords will be removed — you can exclude
              some (e.g., <code>not</code>, <code>very</code>) here to preserve
              them.{" "}
              <a
                href="https://www.nltk.org/nltk_data/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                See NLTK stopwords
              </a>
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            className="text-xs w-full"
            onClick={handleApply}
            disabled={isApplying}
          >
            {isApplying ? "Applying..." : "Apply Stopword Removal"}
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  downloadFile(stopword_s3_url, {
                    filename: "stopword_removal_reviews.csv",
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
          <h4 className="text-sm font-medium text-nlp-blue">
            Stopwords Removed
          </h4>
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
