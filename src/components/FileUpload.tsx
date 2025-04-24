import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

const sampleReviews = [
  { review: "This restaurant has amazing food!" },
  { review: "Terrible experience. Waited for an hour." },
  { review: "The product works as described." },
  { review: "I love this app, it's easy to use." },
  { review: "Not worth the price. Broke within a week." },
];

type FileUploadProps = {
  onFileUpload: (data: string) => void;
};

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
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
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const text = await file.text();

      if (!text.toLowerCase().includes("review")) {
        throw new Error("Missing 'review' field");
      }

      onFileUpload(text);
      setIsUploaded(true);
      toast({
        title: "File uploaded successfully",
        description: "Your review data is ready for processing",
      });
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Invalid file content",
        description: "CSV file must contain a column named 'review'.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const loadSampleData = () => {
    const csvString = ["review", ...sampleReviews.map((r) => r.review)].join("\n");
    onFileUpload(csvString);
    setIsUploaded(true);
    toast({
      title: "Sample data loaded",
      description: "Sample review data is ready for processing",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Upload Review Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
            )}
            <span className="text-lg font-medium mb-1">
              {file ? file.name : "Choose a CSV file or drag & drop"}
            </span>
            <span className="text-sm text-gray-500">
              Only CSV files up to 5MB are accepted. File must contain a <code>review</code> column.
            </span>
          </label>
          {file && !isUploaded && (
            <div className="mt-4 flex items-center gap-2 justify-center text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Click upload to process your file</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={loadSampleData}>
            Use Sample Data
          </Button>
          <Dialog>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="icon">
                      <Eye className="h-5 w-5" />
                      <span className="sr-only">Preview sample data</span>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Preview sample data
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sample Review Data</DialogTitle>
                <DialogDescription>
                  This is the sample CSV content shown in a table view.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-auto max-h-[300px] mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Review</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleReviews.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.review}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading || isUploaded}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUpload;
