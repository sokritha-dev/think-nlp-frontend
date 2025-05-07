import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { useRef } from "react";

interface UseDownloadToastOptions {
  filename?: string;
  mimeType?: string;
}

export const useDownloadToast = () => {
  const downloadInProgressRef = useRef(true);

  const downloadFile = async (
    url: string,
    options?: UseDownloadToastOptions
  ) => {
    if (!url) return;

    const { filename = "download.csv", mimeType = "text/csv" } = options || {};
    const { id, update, dismiss } = toast({
      title: "Starting download...",
      description: "Preparing file...",
      open: true,
      onOpenChange: (open) => {
        // Block closing manually until download is done
        if (!open && downloadInProgressRef.current) return;
        dismiss();
      },
    });

    try {
      const response = await axios.get(url, {
        responseType: "blob",
        onDownloadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / (e.total || 1));
          update({
            id,
            title: "Downloading...",
            description: <ToastProgress percent={percent} />,
          });
        },
      });

      const blob = new Blob([response.data], { type: mimeType });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      update({
        id,
        title: "Download complete!",
        description: `${filename} saved to your device.`,
      });

      downloadInProgressRef.current = false;

      setTimeout(() => dismiss(), 3000);
    } catch (err) {
      update({
        id,
        title: "Download failed",
        description: "Something went wrong during the download.",
      });
    }
  };

  return { downloadFile };
};

const ToastProgress = ({ percent }: { percent: number }) => (
  <div className="mt-2 w-full">
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
    <div className="text-xs text-muted-foreground text-right mt-1">
      {percent}% completed
    </div>
  </div>
);
