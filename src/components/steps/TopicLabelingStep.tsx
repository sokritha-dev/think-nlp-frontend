import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useTopicLabeling } from "@/hooks/useTopicLabeling";
import TextLoader from "@/components/loaders/TextLoader";
import { useNumTopics } from "@/hooks/useNumTopics";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TopicLabelingStep({ onStepComplete, isSample }) {
  const [numTopics] = useNumTopics();

  const searchParams = new URLSearchParams(window.location.search);
  const topicModelId = searchParams.get("topic_model_id");

  const [mode, setMode] = useState<"auto" | "keywords" | "map">("auto");
  const [keywords, setKeywords] = useState("");
  const [labelMap, setLabelMap] = useState<Record<string, string>>(
    Array.from({ length: numTopics }, (_, i) => [`${i}`, ``]).reduce(
      (acc, [k, v]) => ({ ...acc, [k]: v }),
      {}
    )
  );

  const { runLabeling, data, isPending, isSuccess } = useTopicLabeling({
    topicModelId,
    mode,
    keywords,
    labelMap,
  });

  if (!topicModelId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Topic Labeling</CardTitle>
          <CardDescription>Missing topic model ID in URL</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">
            Please complete the topic modeling step before labeling.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderLabelMapInputs = ({ isSample }: { isSample: boolean }) => (
    <div className="space-y-3">
      <label className="text-sm font-medium block mb-1">
        Provide label map for each topic
      </label>
      {Array.from({ length: numTopics }).map((_, i) => (
        <Tooltip key={`map-input-${i}`}>
          <TooltipTrigger asChild>
            <Input
              placeholder={`Label for topic_${i}`}
              value={labelMap[i] || ""}
              disabled={isSample}
              onChange={(e) =>
                setLabelMap({ ...labelMap, [i]: e.target.value })
              }
            />
          </TooltipTrigger>
          {isSample && (
            <TooltipContent>
              Sample mode — manual label input disabled.
            </TooltipContent>
          )}
        </Tooltip>
      ))}
    </div>
  );

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Topic Labeling</CardTitle>
            <CardDescription>
              Assign meaningful names to discovered topics
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Step 4
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="nlp-explanation mb-6">
          <div className="flex gap-2 items-start mb-2">
            <Info className="h-5 w-5 text-blue-700 mt-0.5" />
            <h3 className="font-medium text-nlp-blue">
              What is Topic Labeling?
            </h3>
          </div>
          <p className="mb-2">
            Topic labeling assigns human-readable names to machine-discovered
            topics. You can:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Auto-generate based on frequent words</li>
            <li>Use your own keyword list and match best-fit topics</li>
            <li>Provide explicit mapping for topic IDs</li>
          </ul>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium block mb-1">
            Choose Labeling Mode
          </label>
          <div className="flex gap-3">
            <Button
              size="sm"
              variant={mode === "auto" ? "default" : "outline"}
              onClick={() => setMode("auto")}
            >
              Auto
            </Button>
            <Button
              size="sm"
              variant={mode === "keywords" ? "default" : "outline"}
              onClick={() => setMode("keywords")}
            >
              Keywords
            </Button>
            <Button
              size="sm"
              variant={mode === "map" ? "default" : "outline"}
              onClick={() => setMode("map")}
            >
              Label Map
            </Button>
          </div>

          {mode === "auto" && (
            <p className="text-sm text-muted-foreground">
              Automatically assigns labels using top frequent words from each
              topic.
            </p>
          )}

          {mode === "keywords" && (
            <div>
              <label className="text-sm font-medium block mb-1">
                Provide topic keywords (comma separated)
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. Room, Staff, Booking Issues"
                    disabled={isSample}
                  />
                </TooltipTrigger>
                {isSample && (
                  <TooltipContent>
                    Sample mode — keyword editing disabled.
                  </TooltipContent>
                )}
              </Tooltip>

              <p className="text-xs text-muted-foreground mt-1">
                We'll match each keyword to the topic it fits best.
              </p>
            </div>
          )}

          {mode === "map" && renderLabelMapInputs({ isSample })}

          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button
                    className="w-full"
                    onClick={() => runLabeling()}
                    disabled={isPending || isSample}
                  >
                    {isPending ? "Labeling..." : "Run Topic Labeling"}
                  </Button>
                </div>
              </TooltipTrigger>
              {isSample && (
                <TooltipContent>
                  This is sample data. Labeling is disabled for demo mode.
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {isPending && (
            <TextLoader
              topic="Running topic labeling..."
              description="This may take up to 1 minute depending on your dataset."
            />
          )}

          {isSuccess && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Labeled Topics</h3>
              <ul className="space-y-2 text-sm">
                {data.topics.map((topic) => {
                  const matchedText =
                    topic.matched_with === "explicit_map"
                      ? "implemented by label map"
                      : topic.matched_with === "auto match keywords"
                      ? "auto_generated"
                      : "auto-generated by frequency analysis";

                  return (
                    <li
                      key={topic.topic_id}
                      className="p-3 border border-muted rounded bg-muted/30"
                    >
                      <strong>Topic {Number(topic.topic_id) + 1}:</strong>{" "}
                      {topic.label}
                      <br />
                      <span className="text-muted-foreground text-xs italic">
                        {matchedText}
                        {topic.matched_with === "auto match keywords" &&
                          topic.confidence != null && (
                            <> with confidence {topic.confidence.toFixed(2)}</>
                          )}
                      </span>
                    </li>
                  );
                })}
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
