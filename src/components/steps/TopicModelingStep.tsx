import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ENDPOINTS } from "@/constants/api";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import TextLoader from "@/components/loaders/TextLoader";
import { useNumTopics } from "@/hooks/useNumTopics";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TopicModelingStep({
  fileId,
  onStepComplete,
  isSample,
}) {
  const [numTopics, setNumTopics] = useNumTopics();
  const [autoSelect, setAutoSelect] = useState(false);

  const {
    mutate: runTopicModeling,
    data,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async () => {
      const payload = autoSelect
        ? { file_id: fileId }
        : { file_id: fileId, num_topics: numTopics };
      const res = await axios.post(ENDPOINTS.TOPIC_LDA, payload);
      if (res.data.status !== "success")
        throw new Error("Topic modeling failed");
      return res.data.data;
    },
    onSuccess: (data) => {
      const params = new URLSearchParams(window.location.search);
      params.set("topic_model_id", data.topic_model_id);
      const newUrl = window.location.pathname + "?" + params.toString();
      window.history.replaceState({}, "", newUrl);
    },
  });

  useEffect(() => {
    if (fileId) runTopicModeling();
  }, [fileId, autoSelect, numTopics]);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Topic Modeling</CardTitle>
            <CardDescription>
              Discover hidden topics in your review data
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Step 3
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="nlp-explanation mb-6">
          <div className="flex gap-2 items-start mb-2">
            <Info className="h-5 w-5 text-blue-700 mt-0.5" />
            <h3 className="font-medium text-nlp-blue">
              What is Topic Modeling?
            </h3>
          </div>
          <p className="mb-2">
            Topic modeling is an unsupervised machine learning technique that
            discovers abstract "topics" in a collection of documents:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>
              Identifies patterns of word co-occurrence that represent themes
            </li>
            <li>
              Each document can contain multiple topics in different proportions
            </li>
            <li>
              Common algorithms include LDA, NMF, and BERT-based approaches
            </li>
            <li>Requires specifying the number of topics to identify</li>
          </ul>

          <Collapsible className="mt-4">
            <CollapsibleTrigger className="text-sm text-blue-600 hover:underline">
              📊 See how LDA works (simple analogy)
            </CollapsibleTrigger>
            <CollapsibleContent className="text-sm mt-2 space-y-2">
              <p>
                Imagine you walk into a library with 100 books. You don’t know
                the titles or genres.
              </p>
              <ul className="list-disc list-inside pl-4">
                <li>You scan the words inside each book</li>
                <li>
                  You notice “pool”, “beach”, “sun” appear together often →
                  Topic A
                </li>
                <li>“staff”, “friendly”, “service” → Topic B</li>
                <li>Each book mixes these topics in different proportions</li>
              </ul>
              <p>
                That’s what LDA does — it learns hidden topics by spotting word
                patterns, without needing labeled data.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-medium text-sm mb-2 block">
              Number of Topics {autoSelect ? "(Auto)" : `: ${numTopics}`}
            </label>

            {!autoSelect && (
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Slider
                        value={[numTopics || 4]}
                        min={2}
                        max={10}
                        step={1}
                        onValueChange={(val) => {
                          setAutoSelect(false);
                          setNumTopics(val[0]);
                        }}
                        className="w-full"
                        disabled={isSample}
                      />
                    </div>
                  </TooltipTrigger>
                  {isSample && (
                    <TooltipContent>
                      Sample mode — changing number of topics is disabled.
                    </TooltipContent>
                  )}
                </Tooltip>
                <p className="text-xs text-muted-foreground">
                  Choose how many distinct topics to extract from your reviews.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-muted-foreground">
                Automatically choose best number of topics?
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={autoSelect ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoSelect(!autoSelect)}
                    disabled={isSample}
                  >
                    {autoSelect ? "Auto: ON" : "Auto: OFF"}
                  </Button>
                </TooltipTrigger>
                {isSample && (
                  <TooltipContent>
                    Sample mode — auto toggle is locked.
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {isPending && (
            <TextLoader
              topic="Running topic modeling..."
              description="This may take up to 1 minute depending on your dataset."
            />
          )}

          {isSuccess && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Detected Topics</h3>
              <ul className="space-y-2 text-sm">
                {data.topics.map((topic) => (
                  <li
                    key={topic.topic_id}
                    className="p-3 border border-muted rounded bg-muted/30"
                  >
                    <strong>Topic {Number(topic.topic_id) + 1}:</strong>{" "}
                    {topic.keywords}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={onStepComplete} disabled={!isSuccess}>
          Complete & Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
