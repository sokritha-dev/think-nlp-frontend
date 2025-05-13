import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { highlightDiff } from "@/components/TextDiffHighlight";
import { useSpecialRemovalReviews } from "@/hooks/useSpecialRemoval";
import { TechniqueBadgeSection } from "@/components/data-cleaning-step/TechniqueBadgeSection";
import React from "react";
import BeforeAfterTextLoader from "@/components/loaders/BeforeAfterTextLoader";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, Download, Loader2, XCircle } from "lucide-react";
import { useCompressedCSV } from "@/hooks/useDownloadPreviewCSV";
import { useToast } from "@/hooks/use-toast";

interface Badges {
  label: string;
  tip: string;
}

export default function SpecialCharRemovalStep({
  fileId,
  description,
  badges,
  refetchStatus,
}: {
  fileId: string;
  description: string;
  badges: Badges[];
  refetchStatus: () => void;
}) {
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [flags, setFlags] = useState({
    remove_special: true,
    remove_numbers: true,
    remove_emoji: true,
  });

  const { toast } = useToast();
  const { data, isLoading, isApplying, applySpecialClean } =
    useSpecialRemovalReviews(fileId, page, pageSize);

  const { downloadDecompressed, isLoading: isDownloading } = useCompressedCSV(
    data ? data.cleaned_s3_url : "",
    {
      enabled: false,
      filename: "special_character_removal_reviews.csv",
    }
  );

  useEffect(() => {
    if (data?.flags) {
      setFlags(data.flags);
    }
  }, [data?.flags]);

  const handleApply = async () => {
    const { dismiss } = toast({
      title: "Cleaning will update the review data based on selected flags.",
      description: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Applying special character cleaning...</span>
        </div>
      ),
      open: true,
    });

    try {
      await applySpecialClean({ ...flags, file_id: fileId });

      dismiss();

      toast({
        title: "Updated with latest flag settings.",
        description: (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Special character cleaning applied</span>
          </div>
        ),
        duration: 4000,
      });

      await refetchStatus();
    } catch (err: any) {
      console.error("❌ Failed to apply special cleaning:", err);
      dismiss();
      toast({
        title: err?.message || "Something went wrong during processing.",
        description: (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>Failed to apply cleaning</span>
          </div>
        ),
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  if (isLoading || !data) {
    return <BeforeAfterTextLoader />;
  }

  const { before, after, total, should_recompute } = data;
  const totalPages = Math.ceil(total / pageSize);

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
            ⚠️ You made changes in a previous step or config. Please regenerate
            to reflect the latest data.
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground font-medium">
            Select cleaning options:
          </label>
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
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            className="text-xs w-full"
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
              <BeforeAfterTextLoader numberLoader={1} />
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
