// src/pages/Steps.tsx
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import NLPStepTabs from "@/components/NLPStepTabs";
import { Button } from "@/components/ui/button";
import { Clipboard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const StepsPage = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const fileId = searchParams.get("file_id");
  const navigate = useNavigate();

  const shareableUrl = `${window.location.origin}/steps?file_id=${fileId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast({
        title: "🔗 Link copied!",
        description:
          "You can share or bookmark this URL to revisit your analysis later.",
      });
    } catch (err) {
      toast({
        title: "❌ Copy failed",
        description: "Please try again or copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto py-10 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(`/?file_id=${fileId}`)}
          >
            ← Back to Results
          </Button>

          <Button onClick={handleCopy} variant="outline" className="ml-auto">
            <Clipboard className="h-4 w-4 mr-2" />
            Copy Shareable Link
          </Button>
        </div>

        {fileId && <NLPStepTabs fileId={fileId} />}
      </main>
    </div>
  );
};

export default StepsPage;
