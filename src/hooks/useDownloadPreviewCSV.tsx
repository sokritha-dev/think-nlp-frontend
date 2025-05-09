import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import pako from "pako";
import Papa from "papaparse";
import { toast } from "@/hooks/use-toast";
import { useRef } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export const useCompressedCSV = (
  url: string,
  options: {
    enabled?: boolean;
    previewRows?: number;
    filename?: string;
  } = {}
) => {
  const {
    enabled = true,
    previewRows = 20,
    filename = "data.csv.gz",
  } = options;

  const downloadInProgressRef = useRef(true);
  const cancelTokenSourceRef = useRef<AbortController | null>(null);

  // Preview rows from decompressed CSV
  const previewQuery = useQuery({
    queryKey: ["compressed-csv-preview", url, previewRows],
    enabled: !!url && enabled,
    queryFn: async () => {
      const response = await axios.get<ArrayBuffer>(url, {
        responseType: "arraybuffer",
      });

      const compressed = new Uint8Array(response.data);
      const decompressed = pako.ungzip(compressed, { to: "string" });

      const parsed = Papa.parse(decompressed, {
        header: true,
        skipEmptyLines: true,
      });

      const allRows = parsed.data as Record<string, string>[];
      return allRows.slice(0, previewRows);
    },
  });

  const ToastProgress = ({
    percent,
    onCancel,
  }: {
    percent: number;
    onCancel: () => void;
  }) => (
    <div className="mt-2 w-full space-y-1">
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{percent}% completed</span>
        <button
          onClick={onCancel}
          className="text-red-500 hover:underline hover:opacity-90"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const showToastWithProgress = (
    title: string,
    filename: string,
    onCancel: () => void
  ) => {
    const { id, update, dismiss } = toast({
      title,
      description: <ToastProgress percent={0} onCancel={onCancel} />,
      open: true,
      onOpenChange: (open) => {
        if (!open && downloadInProgressRef.current) return;
        dismiss();
      },
    });

    return { id, update, dismiss };
  };

  const cancelDownload = () => {
    cancelTokenSourceRef.current?.abort();
  };

  const handleDownload = async (isDecompressed: boolean) => {
    if (!url) return;

    const finalFilename = isDecompressed
      ? filename.replace(/\.gz$/, "")
      : filename;
    const { id, update, dismiss } = showToastWithProgress(
      `Downloading ${isDecompressed ? "decompressed" : "compressed"} file`,
      finalFilename,
      cancelDownload
    );

    const controller = new AbortController();
    cancelTokenSourceRef.current = controller;

    try {
      const response = await axios.get(url, {
        responseType: isDecompressed ? "arraybuffer" : "blob",
        onDownloadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / (e.total || 1));
          update({
            id,
            title: "Downloading...",
            description: (
              <ToastProgress percent={percent} onCancel={cancelDownload} />
            ),
          });
        },
        signal: controller.signal,
      });

      let blob: Blob;

      if (isDecompressed) {
        const compressed = new Uint8Array(response.data);
        const decompressed = pako.ungzip(compressed, { to: "string" });
        blob = new Blob([decompressed], { type: "text/csv;charset=utf-8;" });
      } else {
        blob = new Blob([response.data], { type: "application/gzip" });
      }

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      update({
        id,
        title: `${finalFilename} saved to your device.`,
        description: (
          <span className="inline-flex items-center text-green-600">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Download complete!
          </span>
        ),
      });

      downloadInProgressRef.current = false;
      setTimeout(() => dismiss(), 3000);
    } catch (err: any) {
      if (axios.isCancel(err) || err.name === "CanceledError") {
        update({
          id,
          title: "The download was canceled by the user.",
          description: (
            <span className="inline-flex items-center text-orange-500">
              <XCircle className="w-4 h-4 mr-1" /> Download canceled
            </span>
          ),
        });
      } else {
        update({
          id,
          title: "Something went wrong during the download.",
          description: (
            <span className="inline-flex items-center text-red-600">
              <XCircle className="w-4 h-4 mr-1" /> Download failed
            </span>
          ),
        });
      }
    }
  };

  const downloadRaw = () => handleDownload(false);
  const downloadDecompressed = () => handleDownload(true);

  return {
    previewData: previewQuery.data,
    isLoading: previewQuery.isLoading,
    isError: previewQuery.isError,
    error: previewQuery.error,
    downloadRaw,
    downloadDecompressed,
    cancelDownload,
  };
};
