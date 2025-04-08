
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

type DataCleaningStepProps = {
  rawData: string;
  onComplete: (cleanedData: string[]) => void;
  onStepComplete: () => void;
};

const DataCleaningStep = ({ rawData, onComplete, onStepComplete }: DataCleaningStepProps) => {
  const [activeTab, setActiveTab] = useState("raw");
  const [processStage, setProcessStage] = useState(0);
  
  // Pre-process the data
  const reviews = rawData.split(/\n+/).filter(line => line.trim().length > 0);
  
  // The stages of cleaning
  const normalizedReviews = reviews.map(review => review.trim());
  const specialCharRemovedReviews = normalizedReviews.map(review => 
    review.replace(/[^\w\s']|_/g, " ").replace(/\s+/g, " ")
  );
  const tokenizedReviews = specialCharRemovedReviews.map(review => 
    review.toLowerCase().split(" ")
  );
  const stopWords = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "s", "t", "can", "will", "just", "don", "don't", "should",
    "now"
  ]);
  const stopWordsRemovedReviews = tokenizedReviews.map(tokens => 
    tokens.filter(token => !stopWords.has(token) && token.length > 1)
  );
  
  // Simple lemmatization (just an example - in real NLP this would use a proper lemmatizer)
  const lemmatizationMap: Record<string, string> = {
    "running": "run",
    "runs": "run",
    "ran": "run",
    "walking": "walk",
    "walks": "walk",
    "walked": "walk",
    "eating": "eat",
    "eats": "eat",
    "ate": "eat",
    "going": "go",
    "goes": "go",
    "went": "go",
    "coming": "come",
    "comes": "come",
    "came": "come",
    "services": "service",
    "servicing": "service",
    "serviced": "service",
    "restaurants": "restaurant",
    "customers": "customer",
    "products": "product",
    "phones": "phone",
    "waiting": "wait",
    "waits": "wait",
    "waited": "wait",
  };
  
  const lemmatizedReviews = stopWordsRemovedReviews.map(tokens => 
    tokens.map(token => lemmatizationMap[token] || token)
  );
  
  const finalCleanedReviews = lemmatizedReviews.map(tokens => tokens.join(" "));
  
  const processSteps = [
    { name: "Raw Data", data: reviews, description: "The original, unprocessed text" },
    { name: "Normalized", data: normalizedReviews, description: "Trimmed whitespace and standardized line breaks" },
    { name: "Special Chars Removed", data: specialCharRemovedReviews, description: "Removed special characters and punctuation" },
    { name: "Tokenized", data: tokenizedReviews.map(t => t.join(" ")), description: "Split text into individual words/tokens" },
    { name: "Stopwords Removed", data: stopWordsRemovedReviews.map(t => t.join(" ")), description: "Removed common words that don't add meaning" },
    { name: "Lemmatized", data: finalCleanedReviews, description: "Reduced words to their base form" }
  ];
  
  const handleComplete = () => {
    onComplete(finalCleanedReviews);
    onStepComplete();
  };
  
  const goToNextStage = () => {
    if (processStage < processSteps.length - 1) {
      setProcessStage(processStage + 1);
    }
  };
  
  const goToPrevStage = () => {
    if (processStage > 0) {
      setProcessStage(processStage - 1);
    }
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Data Cleaning</CardTitle>
            <CardDescription>
              Prepare text data for analysis by cleaning and normalizing
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Step 1
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="nlp-explanation mb-6">
          <div className="flex gap-2 items-start mb-2">
            <Info className="h-5 w-5 text-blue-700 mt-0.5" />
            <h3 className="font-medium text-nlp-blue">What is Data Cleaning?</h3>
          </div>
          <p className="mb-2">
            Data cleaning is a crucial first step in NLP where we prepare text for analysis by:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Normalizing text (removing extra whitespace, standardizing formats)</li>
            <li>Removing special characters and punctuation</li>
            <li>Tokenizing text into individual words</li>
            <li>Removing common "stop words" that don't add significant meaning</li>
            <li>Lemmatizing words (reducing them to their base form)</li>
          </ul>
          <p className="mt-2">
            These steps help improve the accuracy of subsequent analyses by focusing on the most meaningful parts of the text.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="raw">Raw → Cleaned</TabsTrigger>
            <TabsTrigger value="stepbystep">Step-by-Step View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="raw" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Raw Data</h3>
                <div className="bg-muted/30 rounded-md p-3 h-80 overflow-y-auto border border-border">
                  {reviews.map((review, i) => (
                    <div key={`raw-${i}`} className="mb-2 text-sm">
                      {review}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Cleaned Data</h3>
                <div className="bg-muted/30 rounded-md p-3 h-80 overflow-y-auto border border-border">
                  {finalCleanedReviews.map((review, i) => (
                    <div key={`clean-${i}`} className="mb-2 text-sm">
                      {review}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stepbystep" className="space-y-4 pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">{processSteps[processStage].name}</h3>
              <div className="flex gap-2 items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPrevStage}
                  disabled={processStage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">{processStage + 1}/{processSteps.length}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextStage}
                  disabled={processStage === processSteps.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{processSteps[processStage].description}</p>
            
            <div className="bg-muted/30 rounded-md p-3 h-80 overflow-y-auto border border-border">
              {processSteps[processStage].data.map((item, i) => (
                <div key={`stage-${processStage}-${i}`} className="mb-2 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleComplete}>Complete & Continue</Button>
      </CardFooter>
    </Card>
  );
};

export default DataCleaningStep;
