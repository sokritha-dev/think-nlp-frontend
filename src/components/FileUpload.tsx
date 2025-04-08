
import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
      setFile(selectedFile);
      setIsUploaded(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Read the file as text
      const text = await file.text();
      onFileUpload(text);
      setIsUploaded(true);
      toast({
        title: "File uploaded successfully",
        description: "Your review data is ready for processing",
      });
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Error uploading file",
        description: "Please try again with a valid text file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const loadSampleData = () => {
    const sampleReviews = `
      This restaurant has amazing food! The service was excellent and I will definitely come back again.
      Terrible experience. Waited for an hour and the food was cold when it arrived.
      The product works as described. Good value for money, but shipping took longer than expected.
      I love this app, it's intuitive and easy to use. Would recommend to anyone looking for productivity tools.
      Average hotel, nothing special. The rooms were clean but outdated. Location was convenient.
      The customer service was outstanding. They helped resolve my issue immediately.
      Not worth the price. Broke within a week of purchase. Avoid this brand.
      Great course content, but the platform is buggy and videos sometimes don't load properly.
      Highly recommend this book! The author's writing style is engaging and the story is captivating.
      This phone has excellent battery life but the camera quality could be better.
    `;
    
    onFileUpload(sampleReviews);
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
            accept=".txt,.csv,.json"
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
              {file ? file.name : "Choose a file or drag & drop"}
            </span>
            <span className="text-sm text-gray-500">
              Supported formats: TXT, CSV, JSON
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
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={loadSampleData}>
          Use Sample Data
        </Button>
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
