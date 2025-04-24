
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DataCleaningStep from "./steps/DataCleaningStep";
import DataExplorationStep from "./steps/DataExplorationStep";
import TopicModelingStep from "./steps/TopicModelingStep";
import TopicLabelingStep from "./steps/TopicLabelingStep";
import SentimentAnalysisStep from "./steps/SentimentAnalysisStep";

type NLPStepTabsProps = {
  reviewData: string | null;
};

const NLPStepTabs = ({ reviewData }: NLPStepTabsProps) => {
  const [activeTab, setActiveTab] = useState("data-cleaning");
  const [cleanedData, setCleanedData] = useState<string[]>([]);
  const [topics, setTopics] = useState<{ id: number; docs: string[] }[]>([]);
  const [labeledTopics, setLabeledTopics] = useState<{ id: number; label: string; docs: string[] }[]>([]);

  // Handle step completion to enable next steps
  const [stepsCompleted, setStepsCompleted] = useState({
    "data-cleaning": false,
    "data-exploration": false,
    "topic-modeling": false,
    "topic-labeling": false,
    "sentiment-analysis": false,
  });

  const completeStep = (step: string) => {
    setStepsCompleted({
      ...stepsCompleted,
      [step]: true,
    });
  };
  const handleCleanedData = (data: string[]) => {
    setCleanedData(data);
    completeStep("data-cleaning");
    setActiveTab("data-exploration");
  };

  const handleEDA = () => {
    completeStep("data-exploration");
    setActiveTab("topic-modeling");
  };

  const handleTopics = (topics: { id: number; docs: string[] }[]) => {
    setTopics(topics);
  };

  const handleLabeledTopics = (topics: { id: number; label: string; docs: string[] }[]) => {
    setLabeledTopics(topics);

  };


  if (!reviewData) {
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
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
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
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
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
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
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
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
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
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
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
              rawData={reviewData}
              onStepComplete={handleCleanedData}
            />
          </TabsContent>

          <TabsContent value="data-exploration" className="mt-0">
            <DataExplorationStep
              cleanedData={cleanedData}
              onStepComplete={handleEDA}
            />
          </TabsContent>

          <TabsContent value="topic-modeling" className="mt-0">
            <TopicModelingStep
              cleanedData={cleanedData}
              onTopicsGenerated={handleTopics}
              onStepComplete={() => {
                completeStep("topic-modeling");
                setActiveTab("topic-labeling");
              }}
            />
          </TabsContent>

          <TabsContent value="topic-labeling" className="mt-0">
            <TopicLabelingStep
              topics={topics}
              onTopicsLabeled={handleLabeledTopics}
              onStepComplete={() => {
                completeStep("topic-labeling");
                setActiveTab("sentiment-analysis");
              }}
            />
          </TabsContent>

          <TabsContent value="sentiment-analysis" className="mt-0">
            <SentimentAnalysisStep
              labeledTopics={labeledTopics}
              onStepComplete={() => {
                completeStep("sentiment-analysis");

              }}
            />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};

export default NLPStepTabs;
