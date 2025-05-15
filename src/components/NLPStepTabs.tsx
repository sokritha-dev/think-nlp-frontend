import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DataCleaningStep from "./steps/DataCleaningStep";
import DataExplorationStep from "./steps/DataExplorationStep";
import TopicModelingStep from "./steps/TopicModelingStep";
import TopicLabelingStep from "./steps/TopicLabelingStep";
import SentimentAnalysisStep from "./steps/SentimentAnalysisStep";
import Lottie from "lottie-react";
import celebrationAnimation from "@/assets/lottie/congrats.json";
import { Button } from "@/components/ui/button";
import { useCheckFileStatus } from "@/hooks/useCheckFileStatus";

type NLPStepTabsProps = {
  fileId: string | null;
};

const NLPStepTabs = ({ fileId }: NLPStepTabsProps) => {
  const { data: isSample, isLoading: isSampleLoading } =
    useCheckFileStatus(fileId);
  const [activeTab, setActiveTab] = useState("data-cleaning");
  const [showCongrats, setShowCongrats] = useState(false);

  const [stepsCompleted, setStepsCompleted] = useState({
    "data-cleaning": false,
    "data-exploration": false,
    "topic-modeling": false,
    "topic-labeling": false,
    "sentiment-analysis": false,
  });

  const completeStep = (step: string) => {
    const updatedSteps = {
      ...stepsCompleted,
      [step]: true,
    };
    setStepsCompleted(updatedSteps);

    if (
      step === "sentiment-analysis" &&
      activeTab === "sentiment-analysis" &&
      Object.values(updatedSteps).every((v) => v)
    ) {
      setShowCongrats(true);
    }
  };

  const handleCleanedData = () => {
    completeStep("data-cleaning");
    setActiveTab("data-exploration");
  };

  const handleEDA = () => {
    completeStep("data-exploration");
    setActiveTab("topic-modeling");
  };

  if (!fileId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>
          Please upload review data or use sample data to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Card className="md:w-1/5">
            <CardHeader>
              <CardTitle className="text-lg">NLP Pipeline</CardTitle>
              <CardDescription>Process steps</CardDescription>
            </CardHeader>
            <CardContent>
              <TabsList className="flex flex-col w-full h-auto gap-2">
                <TabsTrigger
                  value="data-cleaning"
                  className="w-full justify-between text-left px-3 py-2 h-auto flex items-center"
                >
                  <span className="truncate">1. Data Cleaning</span>
                  {stepsCompleted["data-cleaning"] && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700 border-green-200"
                    >
                      Complete
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="data-exploration"
                  className="w-full justify-between text-left px-3 py-2 h-auto flex items-center"
                  disabled={!stepsCompleted["data-cleaning"]}
                >
                  <span className="truncate">2. Data Exploration</span>
                  {stepsCompleted["data-exploration"] && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700 border-green-200"
                    >
                      Complete
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="topic-modeling"
                  className="w-full justify-between text-left px-3 py-2 h-auto flex items-center"
                  disabled={!stepsCompleted["data-exploration"]}
                >
                  <span className="truncate">3. Topic Modeling</span>
                  {stepsCompleted["topic-modeling"] && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700 border-green-200"
                    >
                      Complete
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="topic-labeling"
                  className="w-full justify-between text-left px-3 py-2 h-auto flex items-center"
                  disabled={!stepsCompleted["topic-modeling"]}
                >
                  <span className="truncate">4. Topic Labeling</span>
                  {stepsCompleted["topic-labeling"] && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700 border-green-200"
                    >
                      Complete
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="sentiment-analysis"
                  className="w-full justify-between text-left px-3 py-2 h-auto flex items-center"
                  disabled={!stepsCompleted["topic-labeling"]}
                >
                  <span className="truncate">5. Sentiment Analysis</span>
                  {stepsCompleted["sentiment-analysis"] && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700 border-green-200"
                    >
                      Complete
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <div className="md:w-4/5">
            <TabsContent value="data-cleaning" className="mt-0">
              <DataCleaningStep
                fileId={fileId}
                onStepComplete={handleCleanedData}
                isSample={isSample}
              />
            </TabsContent>

            <TabsContent value="data-exploration" className="mt-0">
              <DataExplorationStep fileId={fileId} onStepComplete={handleEDA} />
            </TabsContent>

            <TabsContent value="topic-modeling" className="mt-0">
              <TopicModelingStep
                fileId={fileId}
                onStepComplete={() => {
                  completeStep("topic-modeling");
                  setActiveTab("topic-labeling");
                }}
                isSample={isSample}
              />
            </TabsContent>

            <TabsContent value="topic-labeling" className="mt-0">
              <TopicLabelingStep
                onStepComplete={() => {
                  completeStep("topic-labeling");
                  setActiveTab("sentiment-analysis");
                }}
                isSample={isSample}
              />
            </TabsContent>

            <TabsContent value="sentiment-analysis" className="mt-0">
              <SentimentAnalysisStep
                onStepComplete={() => {
                  completeStep("sentiment-analysis");
                }}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {showCongrats && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl ring-2 ring-green-500 px-8 py-6 text-center max-w-lg w-full">
            <Lottie
              animationData={celebrationAnimation}
              loop={false}
              style={{ height: 240 }}
            />
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              🎉 Congrats on Completing Your NLP Journey!
            </h2>
            <p className="text-gray-600 mb-4">
              You've cleaned, explored, modeled, labeled, and analyzed — that's
              a full NLP pipeline. Be proud of your hard work and keep going! 🚀
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm"
              onClick={() => setShowCongrats(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NLPStepTabs;
