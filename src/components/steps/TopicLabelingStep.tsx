
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Tag, PenLine } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type TopicLabelingStepProps = {
  topics: { id: number; docs: string[] }[];
  onTopicsLabeled: (topics: { id: number; label: string; docs: string[] }[]) => void;
  onStepComplete: () => void;
};

const TopicLabelingStep = ({ topics, onTopicsLabeled, onStepComplete }: TopicLabelingStepProps) => {
  const [algorithm, setAlgorithm] = useState("frequency");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [labeledTopics, setLabeledTopics] = useState<{ id: number; label: string; docs: string[] }[]>([]);
  const [manualLabels, setManualLabels] = useState<Record<number, string>>({});
  const { toast } = useToast();

  const handleAlgorithmChange = (value: string) => {
    setAlgorithm(value);
  };

  const handleManualLabelChange = (topicId: number, label: string) => {
    setManualLabels({
      ...manualLabels,
      [topicId]: label
    });
  };

  const runTopicLabeling = () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      // For the demo, generate some automatic labels based on common words
      const labelTopics = () => {
        // Extract most frequent words in each topic
        const topicKeywords: Record<number, Record<string, number>> = {};
        
        topics.forEach(topic => {
          const wordFreq: Record<string, number> = {};
          
          topic.docs.forEach(doc => {
            const words = doc.split(" ");
            words.forEach(word => {
              if (word && word.length > 3) { // Only count words longer than 3 chars
                wordFreq[word] = (wordFreq[word] || 0) + 1;
              }
            });
          });
          
          topicKeywords[topic.id] = wordFreq;
        });
        
        // Generate labels based on top keywords
        const autoLabels: Record<number, string> = {};
        
        Object.entries(topicKeywords).forEach(([topicId, keywords]) => {
          const id = parseInt(topicId);
          const sortedWords = Object.entries(keywords)
            .sort((a, b) => b[1] - a[1])
            .map(([word]) => word)
            .slice(0, 5);
          
          // Simple heuristics for labeling
          if (sortedWords.some(w => ["food", "restaurant", "menu", "service", "waiter", "delicious", "taste"].includes(w))) {
            autoLabels[id] = "Restaurant & Dining";
          } else if (sortedWords.some(w => ["product", "quality", "purchase", "buy", "delivery", "price", "value"].includes(w))) {
            autoLabels[id] = "Product Experience";
          } else if (sortedWords.some(w => ["app", "website", "use", "feature", "interface", "user", "login"].includes(w))) {
            autoLabels[id] = "App & Website";
          } else if (sortedWords.some(w => ["hotel", "room", "stay", "clean", "comfort", "bed", "staff"].includes(w))) {
            autoLabels[id] = "Hotel & Accommodation";
          } else if (sortedWords.some(w => ["service", "customer", "support", "help", "issue", "problem", "resolved"].includes(w))) {
            autoLabels[id] = "Customer Service";
          } else {
            autoLabels[id] = `Topic ${id + 1}: ${sortedWords.slice(0, 2).join(", ")}`;
          }
        });
        
        return topics.map(topic => ({
          id: topic.id,
          label: manualLabels[topic.id] || autoLabels[topic.id] || `Topic ${topic.id + 1}`,
          docs: topic.docs
        }));
      };
      
      const labeled = labelTopics();
      setLabeledTopics(labeled);
      onTopicsLabeled(labeled);
      setIsProcessing(false);
      setIsComplete(true);
      
      toast({
        title: "Topic labeling complete",
        description: "Topics have been labeled automatically",
      });
    }, 1500);
  };

  const saveManualLabels = () => {
    const updated = labeledTopics.map(topic => ({
      ...topic,
      label: manualLabels[topic.id] || topic.label
    }));
    
    setLabeledTopics(updated);
    onTopicsLabeled(updated);
    
    toast({
      title: "Labels updated",
      description: "Your manual topic labels have been saved",
    });
  };

  const handleComplete = () => {
    onStepComplete();
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Topic Labeling</CardTitle>
            <CardDescription>
              Assign meaningful names to the discovered topics
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Step 4
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="nlp-explanation mb-6">
          <div className="flex gap-2 items-start mb-2">
            <Info className="h-5 w-5 text-blue-700 mt-0.5" />
            <h3 className="font-medium text-nlp-blue">What is Topic Labeling?</h3>
          </div>
          <p className="mb-2">
            Topic labeling assigns human-interpretable names to the abstract topics discovered during modeling:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Transforms statistical patterns into meaningful categories</li>
            <li>Can be performed automatically using keyword extraction</li>
            <li>Often benefits from human refinement for accuracy</li>
            <li>Helps make topic modeling results actionable and insightful</li>
          </ul>
          <p className="mt-2">
            Good topic labels should capture the essence of what makes each topic distinct and meaningful.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Labeling Method</h3>
            <Select value={algorithm} onValueChange={handleAlgorithmChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frequency">Keyword Frequency Analysis</SelectItem>
                <SelectItem value="tfidf">TF-IDF Extraction</SelectItem>
                <SelectItem value="llm">LLM-Based Summarization</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {algorithm === "frequency" && "Labels topics based on the most frequent distinctive words."}
              {algorithm === "tfidf" && "Uses TF-IDF to identify words that best distinguish each topic."}
              {algorithm === "llm" && "Utilizes language models to generate descriptive labels by summarizing topic content."}
            </p>
          </div>
          
          <div>
            <Button 
              onClick={runTopicLabeling} 
              disabled={isProcessing || isComplete}
              className="w-full"
            >
              {isProcessing ? "Processing..." : isComplete ? "Topics Labeled" : "Generate Labels"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              After automatic labeling, you can manually refine the results below.
            </p>
          </div>
        </div>
        
        {isComplete && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Topic Labels</h3>
              <Button size="sm" variant="outline" onClick={saveManualLabels}>
                <PenLine className="h-4 w-4 mr-2" />
                Save Manual Edits
              </Button>
            </div>
            
            <div className="space-y-3">
              {labeledTopics.map((topic) => (
                <div key={`topic-label-${topic.id}`} className="flex flex-col md:flex-row gap-3 p-3 bg-muted/30 rounded-md border border-border">
                  <div className="w-full md:w-1/3">
                    <div className="flex items-center mb-2">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Topic {topic.id + 1}</span>
                    </div>
                    <Input
                      value={manualLabels[topic.id] || topic.label}
                      onChange={(e) => handleManualLabelChange(topic.id, e.target.value)}
                      placeholder="Enter custom label"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex-1 text-sm">
                    <div className="mb-1 text-xs text-muted-foreground">Sample reviews in this topic:</div>
                    <div className="max-h-20 overflow-y-auto">
                      {topic.docs.slice(0, 2).map((doc, i) => (
                        <div key={`topic-${topic.id}-example-${i}`} className="mb-1">
                          {doc}
                        </div>
                      ))}
                      {topic.docs.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{topic.docs.length - 2} more reviews
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleComplete} disabled={!isComplete}>
          Complete & Continue
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TopicLabelingStep;
