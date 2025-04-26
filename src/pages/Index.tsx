import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import NLPStepTabs from "@/components/NLPStepTabs";
import { SentimentCharts } from "@/components/SentimentCharts";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSampleSentiment } from "@/hooks/useSampleSentiment";

const Index = () => {
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [useSample, setUseSample] = useState(false);

  const {
    data: sentimentResult,
    isLoading,
    isError,
  } = useSampleSentiment(useSample); // fetch only using sample data


  const handleFileUpload = async (data: string) => {
    setReviewData(data);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto py-10 px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-nlp-blue mb-3">
            Welcome to ThinkNLP Lab – Customer Insight Analyzer
          </h1>
          <p className="text-gray-600 text-lg">
            Upload customer reviews and let AI uncover sentiment and key discussion themes instantly.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-12">
          <FileUpload onFileUpload={handleFileUpload} setUseSample={setUseSample} />
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <Loader2 className="h-8 w-8 text-nlp-blue animate-spin mb-4" />
            <p className="text-sm text-gray-600">Processing your data...</p>
          </div>
        )}

        {!isLoading && sentimentResult && !showSteps && (
          <div className="animate-fade-in space-y-10">
            <SentimentCharts sentimentResults={sentimentResult} />
            <div className="text-center mt-12">
              <div className="inline-flex flex-col items-center justify-center gap-3 bg-white border border-gray-200 px-8 py-6 rounded-xl shadow-sm">
                <p className="text-lg font-semibold text-gray-800">
                  Want to understand how these insights were generated?
                </p>
                <p className="text-sm text-gray-500 max-w-sm">
                  Dive into each step of the NLP pipeline — from data cleaning to topic modeling and sentiment analysis.
                </p>
                <Button onClick={() => navigate("/steps", { state: { reviewData } })}>
                  🧠 Explore NLP Steps →
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && reviewData && showSteps && (
          <NLPStepTabs reviewData={reviewData} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 mt-10">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          ThinkNLP Lab • Built for Learning
        </div>
      </footer>
    </div>
  );
};

export default Index;
