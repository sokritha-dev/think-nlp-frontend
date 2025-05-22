import { Dispatch, SetStateAction, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { uploadFile, runSentimentPipeline } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import axios from "axios";
import { useCompressedCSV } from "@/hooks/useDownloadPreviewCSV";

// Props
interface FileUploadProps {
  onFileUpload: (data: any) => void;
  setUseSample: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const FileUpload = ({
  onFileUpload,
  setUseSample,
  loading,
  setLoading,
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [showSampleDialog, setShowSampleDialog] = useState(false);
  const [sampleUrl, setSampleUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    previewData: sampleData,
    isLoading: isFetching,
    isError,
    error,
    downloadDecompressed: downloadSampleCSV,
  } = useCompressedCSV(sampleUrl ?? "", {
    enabled: !!sampleUrl,
    previewRows: 10,
    filename: "sample-data.csv.gz",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const isCSV = selectedFile.name.endsWith(".csv");
    const isTooLarge = selectedFile.size > 5 * 1024 * 1024; // 5MB

    if (!isCSV) {
      toast({
        title: "Invalid file format",
        description: "Only CSV files are supported.",
        variant: "destructive",
      });
      return;
    }

    if (isTooLarge) {
      toast({
        title: "File too large",
        description: "File size must be 5MB or less.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setIsUploaded(false);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      if (!text.toLowerCase().includes("review")) {
        throw new Error("Missing 'review' field");
      }

      const uploadRes = await uploadFile(file);
      const fileId = uploadRes?.data?.data?.file_id;
      if (!fileId) throw new Error("Upload succeeded but file ID missing");

      const sentimentRes = await runSentimentPipeline(fileId);

      setIsUploaded(true);
      toast({
        title: "✅ Analysis Complete",
        description: "Sentiment insights have been successfully generated!",
      });
      console.log('')
      onFileUpload(sentimentRes.data.data);
    } catch (error: any) {
      console.error("❌ Error during analysis:", error);
      toast({
        title: "Analysis Failed",
        description:
          error?.response?.data?.detail || error.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-slate-50 border border-gray-200 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-nlp-blue">
          📤 Upload Review Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-nlp-blue transition-all">
          <input
            type="file"
            id="file-upload"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            {isUploaded ? (
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
            ) : (
              <Upload className="h-12 w-12 text-nlp-blue mb-2" />
            )}
            <span className="text-lg font-medium mb-1">
              {file ? file.name : "Choose a CSV file or drag & drop"}
            </span>
            <span className="text-sm text-gray-500">
              Must contain a{" "}
              <code className="text-xs px-1 py-0.5 bg-slate-100 rounded">
                review
              </code>{" "}
              column. Max 5MB.
            </span>
          </label>
          {file && !isUploaded && (
            <div className="mt-4 flex items-center gap-2 justify-center text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Click analyze to process your file</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div className="flex flex-col items-start gap-2">
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => {
                setUseSample(true);
                toast({
                  title: "📊 Sample data loaded",
                  description: "Sample data is now ready for analysis.",
                });
              }}
            >
              Use Sample Data
            </Button>

            <Dialog open={showSampleDialog} onOpenChange={setShowSampleDialog}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          setShowSampleDialog(true);
                          try {
                            const res = await axios.get(
                              ENDPOINTS.SAMPLE_DATA_URL,
                              {
                                params: {
                                  file_id: import.meta.env
                                    .VITE_SAMPLE_FILE_DOWNLOAD,
                                },
                              }
                            );
                            setSampleUrl(res.data.data.s3_url);
                          } catch (err) {
                            toast({
                              title: "Failed to load sample file URL",
                              description: "Please try again later.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Eye className="h-5 w-5 text-gray-500 hover:text-blue-600" />
                        <span className="sr-only">Preview sample data</span>
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Preview sample data
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DialogContent className="max-w-4xl w-full">
                <DialogHeader>
                  <DialogTitle>📝 Sample Review Data</DialogTitle>
                  <DialogDescription>
                    This is the first 10 rows of the sample dataset.
                  </DialogDescription>

                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={downloadSampleCSV}
                      variant="outline"
                      size="sm"
                      className="text-sm px-3"
                    >
                      ⬇️ Download CSV
                    </Button>
                  </div>
                </DialogHeader>

                <div className="overflow-auto max-h-[400px] rounded-md border border-gray-200">
                  {isFetching ? (
                    <p className="text-sm text-muted-foreground p-4">
                      Loading sample data...
                    </p>
                  ) : isError ? (
                    <p className="text-sm text-red-500 p-4">
                      Failed to load preview: {error?.message}
                    </p>
                  ) : (
                    <Table className="min-w-[600px] text-sm">
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          {sampleData?.[0] &&
                            Object.keys(sampleData[0]).map((key) => (
                              <TableHead
                                key={key}
                                className="whitespace-nowrap font-medium"
                              >
                                {key}
                              </TableHead>
                            ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sampleData?.map((row, index) => (
                          <TableRow key={index}>
                            {Object.values(row).map((value, i) => (
                              <TableCell
                                key={i}
                                className="whitespace-nowrap max-w-[250px] truncate"
                              >
                                {String(value)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-xs text-muted-foreground pl-1">
            You can preview before using the sample.
          </p>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!file || loading || isUploaded}
          className="w-full md:w-auto"
        >
          {loading ? "⏳ Analyzing..." : "🔍 Analyze Reviews"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUpload;
