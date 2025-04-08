
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Info, PieChart, CircleOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TopicModelingStepProps = {
  cleanedData: string[];
  onTopicsGenerated: (topics: { id: number; docs: string[] }[]) => void;
  onStepComplete: () => void;
};

const TopicModelingStep = ({ cleanedData, onTopicsGenerated, onStepComplete }: TopicModelingStepProps) => {
  const [algorithm, setAlgorithm] = useState("lda");
  const [numTopics, setNumTopics] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [topics, setTopics] = useState<{ id: number; docs: string[] }[]>([]);
  const { toast } = useToast();

  const handleAlgorithmChange = (value: string) => {
    setAlgorithm(value);
  };

  const handleNumTopicsChange = (value: number[]) => {
    setNumTopics(value[0]);
  };

  const runTopicModeling = () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      // For the demo, we'll create a very simple "topic modeling" 
      // In a real application, you would use an actual topic modeling algorithm
      const mockTopicModeling = () => {
        // Create a simple TF-IDF like matrix
        const wordDocs: Record<string, number[]> = {};
        cleanedData.forEach((doc, docIndex) => {
          const words = doc.split(" ");
          const uniqueWords = [...new Set(words)];
          uniqueWords.forEach(word => {
            if (!wordDocs[word]) {
              wordDocs[word] = Array(cleanedData.length).fill(0);
            }
            const count = words.filter(w => w === word).length;
            wordDocs[word][docIndex] = count;
          });
        });
        
        // Select some "seed" words for each topic (in a real scenario these would be determined algorithmically)
        const topicSeeds = [
          ["food", "restaurant", "service", "delicious", "menu"],
          ["product", "quality", "price", "value", "purchase"],
          ["app", "use", "interface", "feature", "user"]
        ];
        
        // Assign docs to topics based on seed word presence
        const topics: { id: number; docs: string[] }[] = Array(numTopics).fill(null).map((_, i) => ({ 
          id: i, 
          docs: [] 
        }));
        
        cleanedData.forEach((doc, docIndex) => {
          const docWords = doc.split(" ");
          const topicScores = topicSeeds.map((seeds, topicId) => {
            const score = seeds.reduce((acc, seed) => {
              return acc + (docWords.includes(seed) ? 1 : 0);
            }, 0);
            return { topicId, score };
          });
          
          // Find topic with highest score
          const bestTopic = topicScores.sort((a, b) => b.score - a.score)[0];
          
          // If no clear winner (all scores 0), assign to random topic
          const assignedTopicId = bestTopic.score > 0 
            ? bestTopic.topicId 
            : Math.floor(Math.random() * numTopics);
          
          topics[assignedTopicId].docs.push(doc);
        });
        
        return topics.slice(0, numTopics);
      };
      
      const generatedTopics = mockTopicModeling();
      setTopics(generatedTopics);
      onTopicsGenerated(generatedTopics);
      setIsProcessing(false);
      setIsComplete(true);
      
      toast({
        title: "Topic modeling complete",
        description: `Identified ${numTopics} topics in your data`,
      });
    }, 2000);
  };

  const handleComplete = () => {
    onStepComplete();
  };

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
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Step 3
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="nlp-explanation mb-6">
          <div className="flex gap-2 items-start mb-2">
            <Info className="h-5 w-5 text-blue-700 mt-0.5" />
            <h3 className="font-medium text-nlp-blue">What is Topic Modeling?</h3>
          </div>
          <p className="mb-2">
            Topic modeling is an unsupervised machine learning technique that discovers abstract "topics" in a collection of documents:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>It identifies patterns of word co-occurrence that represent themes</li>
            <li>Each document can contain multiple topics in different proportions</li>
            <li>Common algorithms include LDA (Latent Dirichlet Allocation), NMF, and BERT-based approaches</li>
            <li>Requires specifying the number of topics to identify</li>
          </ul>
          <p className="mt-2">
            Topic modeling helps organize and summarize large text collections and discover hidden patterns.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Algorithm Selection</h3>
            <Select value={algorithm} onValueChange={handleAlgorithmChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lda">Latent Dirichlet Allocation (LDA)</SelectItem>
                <SelectItem value="nmf">Non-negative Matrix Factorization (NMF)</SelectItem>
                <SelectItem value="bert">BERT Embedding Clustering</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {algorithm === "lda" && "LDA is a probabilistic model that identifies topics based on word co-occurrence patterns."}
              {algorithm === "nmf" && "NMF decomposes the document-term matrix to find topics as non-negative linear combinations of terms."}
              {algorithm === "bert" && "Uses BERT embeddings with clustering to identify semantically similar document groups."}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Number of Topics: {numTopics}</h3>
            <Slider
              value={[numTopics]}
              min={2}
              max={6}
              step={1}
              onValueChange={handleNumTopicsChange}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Choose how many distinct topics to identify in your data. Too few may merge unrelated topics, too many may create overly specific categories.
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <Button 
            onClick={runTopicModeling} 
            disabled={isProcessing || isComplete}
            className="w-full md:w-auto"
          >
            {isProcessing ? "Processing..." : isComplete ? "Topics Generated" : "Run Topic Modeling"}
          </Button>
        </div>
        
        {isComplete && (
          <Tabs defaultValue="topic-1">
            <TabsList className="mb-4">
              {topics.map((topic, i) => (
                <TabsTrigger key={`topic-tab-${i}`} value={`topic-${i + 1}`}>
                  Topic {i + 1} ({topic.docs.length} reviews)
                </TabsTrigger>
              ))}
            </TabsList>
            
            {topics.map((topic, i) => (
              <TabsContent key={`topic-content-${i}`} value={`topic-${i + 1}`}>
                <div className="bg-muted/30 rounded-md p-3 h-60 overflow-y-auto border border-border">
                  {topic.docs.length > 0 ? (
                    topic.docs.map((doc, j) => (
                      <div key={`topic-${i}-doc-${j}`} className="mb-2 text-sm">
                        {doc}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <CircleOff className="h-8 w-8 mb-2" />
                      <p>No documents assigned to this topic</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
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

export default TopicModelingStep;
