// src/pages/Index.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  WifiOff,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import {
  SentimentResults,
  useSentimentResult,
} from "@/hooks/useSampleSentiment";
import { useLoadingMessages } from "@/hooks/useLoadingMessages";
import { toast } from "@/hooks/use-toast";
import { SentimentByTopicChart } from "@/components/sentiment-charts/SentimentByTopicChart";
import { SentimentOverallChart } from "@/components/sentiment-charts/SentimentOverallChart";

const Index = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const fileId = searchParams.get("file_id");

  const [userSentimentResult, setUserSentimentResult] =
    useState<SentimentResults | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [useSample, setUseSample] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadingMessage = useLoadingMessages();

  const {
    data: sentimentResult,
    isLoading,
    isError,
    error,
    refetch,
  } = useSentimentResult(
    useSample
      ? import.meta.env.VITE_SAMPLE_FILE_ID
      : userSentimentResult?.file_id || fileId
  );

  const finalSentimentResult = sentimentResult || userSentimentResult;
  const isFinalLoading =
    isLoading || isUploading || finalSentimentResult?.status === "processing";

  const handleFileUpload = async (data: SentimentResults) => {
    setUserSentimentResult(data);
    setShowSteps(false);
    toast({
      title: "📄 File uploaded",
      description: "Your file is ready for NLP processing!",
    });
  };

  const isNetworkError =
    error instanceof Error && error.message === "Network Error";

  useEffect(() => {
    if (isError) {
      toast({
        title: "❌ Sentiment Load Failed",
        description: isNetworkError
          ? "No internet connection. Please reconnect."
          : (error as Error).message || "Unexpected backend error.",
        variant: "destructive",
      });
    }
  }, [isError, error]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50">
      <Header />
      <main className="flex-1 container mx-auto py-10 px-4 max-w-5xl">
        <motion.section
          className="text-center space-y-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-nlp-blue flex items-center justify-center gap-2">
            <Sparkles className="text-violet-600" /> ThinkNLP Lab
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            Understand customer feedback through AI-powered topic & sentiment
            analysis.
          </p>
        </motion.section>

        <motion.section
          className="max-w-3xl mx-auto mt-10 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <FileUpload
            onFileUpload={handleFileUpload}
            setUseSample={setUseSample}
            loading={isUploading}
            setLoading={setIsUploading}
          />
        </motion.section>

        {isFinalLoading && (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative">
              <Loader2 className="h-14 w-14 text-blue-600 animate-spin mb-4" />
              <div className="absolute inset-0 h-14 w-14 rounded-full border-t-2 border-blue-200 animate-ping opacity-30"></div>
            </div>
            <p className="text-lg font-semibold text-gray-700">
              Crunching your data...
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto italic transition-all duration-300 ease-in-out">
              {loadingMessage}
            </p>
          </motion.div>
        )}

        {isError && (
          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <div className="inline-flex flex-col items-center gap-4 bg-white border border-red-200 p-8 rounded-xl shadow-md">
              {isNetworkError ? (
                <WifiOff className="text-red-500 w-8 h-8" />
              ) : (
                <AlertTriangle className="text-amber-500 w-8 h-8" />
              )}
              <h2 className="text-xl font-semibold text-gray-800">
                {isNetworkError
                  ? "No Internet Connection"
                  : "Something went wrong"}
              </h2>
              <p className="text-sm text-gray-500 max-w-sm">
                {isNetworkError
                  ? "Please reconnect and try again."
                  : error instanceof Error
                  ? error.message
                  : "An error occurred while loading sentiment data."}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                🔁 Retry
              </Button>
            </div>
          </motion.div>
        )}

        {!isFinalLoading &&
          finalSentimentResult &&
          finalSentimentResult.status === "done" &&
          !showSteps && (
            <section className="space-y-12 mt-14">
              <h2 className="text-center text-2xl font-semibold text-nlp-blue">
                📊 Analysis Summary
              </h2>
              <SentimentOverallChart {...finalSentimentResult.overall} />
              <SentimentByTopicChart data={finalSentimentResult.per_topic} />
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6 rounded-2xl text-white shadow-lg inline-flex flex-col items-center gap-4">
                  <p className="text-xl font-bold">
                    Curious how these insights were generated?
                  </p>
                  <p className="text-sm max-w-sm opacity-90">
                    Dive into the NLP pipeline — from raw text to insightful
                    charts.
                  </p>
                  <Button
                    onClick={() =>
                      navigate(`/steps?file_id=${finalSentimentResult.file_id}`)
                    }
                    className="bg-white text-indigo-700 hover:bg-indigo-50"
                  >
                    🧠 Explore NLP Steps <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </section>
          )}
      </main>

      <footer className="border-t mt-16 text-sm text-muted-foreground">
        <div className="container mx-auto flex items-center justify-center h-12">
          © {new Date().getFullYear()} ThinkNLP Lab • Built for Learning
        </div>
      </footer>
    </div>
  );
};

export default Index;
