import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Download, Info } from "lucide-react";
import { useSentimentAnalysis } from "@/hooks/useSentimentAnalysis";
import { SentimentOverallChart } from "@/components/sentiment-charts/SentimentOverallChart";
import { SentimentByTopicChart } from "@/components/sentiment-charts/SentimentByTopicChart";
import TextLoader from "@/components/loaders/TextLoader";
import html2canvas from "html2canvas";

export default function SentimentAnalysisStep({
  onStepComplete,
}) {
  const searchParams = new URLSearchParams(window.location.search);
  const topicModelId = searchParams.get("topic_model_id");
  const chartRef = useRef(null);
  const [algorithm, setAlgorithm] = useState("vader");
  const [shouldRecompute, setShouldRecompute] = useState(false);

  const {
    data,
    isLoading,
    isError,
    runAnalysis,
    isRunning,
    shouldRecompute: needRecompute,
    notFound,
  } = useSentimentAnalysis({ topicModelId, algorithm });

  useEffect(() => {
    if (data && "should_recompute" in data) {
      setShouldRecompute(needRecompute);
    }
  }, [data]);

  const handleRun = () => {
    runAnalysis();
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Sentiment Analysis</CardTitle>
            <CardDescription>
              Analyze the emotional tone of reviews by topic
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Step 5
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="flex gap-2 items-start mb-2">
            <Info className="h-5 w-5 text-blue-700 mt-0.5" />
            <h3 className="font-medium text-nlp-blue">
              What is Sentiment Analysis?
            </h3>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
            <li>Classifies text as positive, negative, or neutral</li>
            <li>Can be rule-based or model-based</li>
            <li>Reveals emotional tone in user feedback</li>
            <li>Used to detect strengths and pain points</li>
          </ul>

          <Collapsible className="mt-4">
            <CollapsibleTrigger className="text-sm text-blue-600 hover:underline">
              🧠 See how different sentiment models work
            </CollapsibleTrigger>
            <CollapsibleContent className="text-sm mt-2 space-y-4">
              <div>
                <strong>VADER</strong> is a rule-based model trained on social
                media text. It uses a dictionary of lexical features and
                calculates sentiment from those features.
              </div>
              <div>
                <strong>TextBlob</strong> uses a pre-trained Naive Bayes
                classifier and provides a polarity score between -1 and 1.
              </div>
              <div>
                <strong>BERT</strong> is a deep learning model that understands
                context and nuance, producing state-of-the-art accuracy but at
                higher computation cost.
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger>
                <SelectValue placeholder="Select analyzer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vader">VADER</SelectItem>
                <SelectItem value="textblob">TextBlob</SelectItem>
                <SelectItem value="bert">BERT</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {algorithm === "vader" &&
                "Lexicon-based, works well for short, social content."}
              {algorithm === "textblob" &&
                "Polarity and subjectivity scores using a simple API."}
              {algorithm === "bert" &&
                "Transformer-based deep contextual understanding."}
            </p>
          </div>
          <div>
            {(shouldRecompute || isError) && (
              <Button
                className="w-full"
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? "Analyzing..." : "Run Sentiment Analysis"}
              </Button>
            )}
          </div>
        </div>

        {(isLoading || isRunning) && (
          <TextLoader
            topic="Running sentiment analysis..."
            description="This may take up a few minutes depending on your dataset."
          />
        )}

        {notFound && (
          <div className="text-sm text-muted-foreground mb-4 border border-yellow-200 bg-yellow-50 rounded p-4">
            <strong>This analysis has not been run yet.</strong> Click "Run
            Sentiment Analysis" to compute results using the selected method.
          </div>
        )}

        {data && data.per_topic && data.per_topic.length > 0 && (
          <div className="flex flex-col">
            <div ref={chartRef} className="space-y-10">
              <SentimentOverallChart {...data.overall} />
              <SentimentByTopicChart data={data.per_topic} />
            </div>
            <Button
              variant="outline"
              className="ml-auto mb-4 self-end"
              onClick={async () => {
                if (chartRef.current) {
                  const canvas = await html2canvas(chartRef.current);
                  const link = document.createElement("a");
                  link.download = "sentiment-analysis.png";
                  link.href = canvas.toDataURL();
                  link.click();
                }
              }}
            >
              <Download className="w-4 h-4 mr-1" /> <span>Export Image</span>
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={onStepComplete}
          disabled={!data || !data.per_topic?.length}
        >
          Complete NLP Pipeline
        </Button>
      </CardFooter>
    </Card>
  );
}
