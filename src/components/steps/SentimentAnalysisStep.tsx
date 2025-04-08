
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Smile, Frown, Meh, BarChart4 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CartesianGrid, Legend, Line, LineChart, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

type SentimentAnalysisStepProps = {
  labeledTopics: { id: number; label: string; docs: string[] }[];
  onStepComplete: () => void;
};

// Types for the sentiment analysis results
type TopicSentiment = {
  topicId: number;
  topicLabel: string;
  positive: number;
  neutral: number;
  negative: number;
  average: number;
};

type SentimentResults = {
  byTopic: TopicSentiment[];
  overall: {
    positive: number;
    neutral: number;
    negative: number;
    average: number;
  };
};

const SentimentAnalysisStep = ({ labeledTopics, onStepComplete }: SentimentAnalysisStepProps) => {
  const [algorithm, setAlgorithm] = useState("vader");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sentimentResults, setSentimentResults] = useState<SentimentResults | null>(null);
  
  const { toast } = useToast();

  const handleAlgorithmChange = (value: string) => {
    setAlgorithm(value);
  };

  // This function would call your backend API instead of doing calculations in the frontend
  const runSentimentAnalysis = () => {
    setIsProcessing(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      // Mock data that would come from your backend
      const mockResults: SentimentResults = {
        byTopic: labeledTopics.map(topic => ({
          topicId: topic.id,
          topicLabel: topic.label,
          positive: Math.random() * 60 + 20, // random percentage between 20-80%
          neutral: Math.random() * 40 + 10, // random percentage between 10-50%
          negative: Math.random() * 30 + 5, // random percentage between 5-35%
          average: Math.random() * 2 - 1, // random score between -1 and 1
        })),
        overall: {
          positive: 55,
          neutral: 30,
          negative: 15,
          average: 0.4
        }
      };
      
      // Ensure percentages add up to 100% for each topic
      mockResults.byTopic = mockResults.byTopic.map(topic => {
        const total = topic.positive + topic.neutral + topic.negative;
        return {
          ...topic,
          positive: (topic.positive / total) * 100,
          neutral: (topic.neutral / total) * 100,
          negative: (topic.negative / total) * 100
        };
      });
      
      setSentimentResults(mockResults);
      setIsProcessing(false);
      setIsComplete(true);
      
      toast({
        title: "Sentiment analysis complete",
        description: `Overall sentiment: ${getSentimentText(mockResults.overall.average)}`,
      });
    }, 2000); // Simulate 2-second API call
  };

  const getSentimentText = (score: number) => {
    if (score > 0.2) return "Positive";
    if (score < -0.2) return "Negative";
    return "Neutral";
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.2) return <Smile className="h-5 w-5 text-green-500" />;
    if (score < -0.2) return <Frown className="h-5 w-5 text-red-500" />;
    return <Meh className="h-5 w-5 text-amber-500" />;
  };

  const COLORS = ['#4FD1C5', '#A0AEC0', '#FC8181'];

  const handleComplete = () => {
    onStepComplete();
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
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Step 5
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="nlp-explanation mb-6">
          <div className="flex gap-2 items-start mb-2">
            <Info className="h-5 w-5 text-blue-700 mt-0.5" />
            <h3 className="font-medium text-nlp-blue">What is Sentiment Analysis?</h3>
          </div>
          <p className="mb-2">
            Sentiment analysis identifies and extracts emotional tone and subjective information from text:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Typically classifies text as positive, negative, or neutral</li>
            <li>Can be rule-based (using lexicons) or machine learning-based</li>
            <li>Reveals how customers feel about different topics or aspects</li>
            <li>Helps prioritize areas for improvement and identify strengths</li>
          </ul>
          <p className="mt-2">
            Combining sentiment analysis with topic modeling provides powerful insights about specific aspects of products or services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Sentiment Analyzer</h3>
            <Select value={algorithm} onValueChange={handleAlgorithmChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vader">VADER (Rule-based)</SelectItem>
                <SelectItem value="textblob">TextBlob</SelectItem>
                <SelectItem value="bert">BERT for Sentiment</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {algorithm === "vader" && "VADER is specifically tuned for social media content and short texts like reviews."}
              {algorithm === "textblob" && "TextBlob provides a simple API for sentiment analysis with polarity scores."}
              {algorithm === "bert" && "BERT-based models provide state-of-the-art sentiment analysis with deep contextual understanding."}
            </p>
          </div>
          
          <div>
            <Button 
              onClick={runSentimentAnalysis} 
              disabled={isProcessing || isComplete}
              className="w-full"
            >
              {isProcessing ? "Processing..." : isComplete ? "Analysis Complete" : "Analyze Sentiment"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              The analyzer will classify each review as positive, negative, or neutral and provide aggregated results by topic.
            </p>
          </div>
        </div>
        
        {isComplete && sentimentResults && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-4">Overall Sentiment Distribution</h3>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Positive", value: sentimentResults.overall.positive },
                            { name: "Neutral", value: sentimentResults.overall.neutral },
                            { name: "Negative", value: sentimentResults.overall.negative }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => {
                            // Safely convert percent to number for toFixed
                            const percentValue = typeof percent === 'number' ? percent : 0;
                            return `${name} (${(percentValue * 100).toFixed(1)}%)`;
                          }}
                        >
                          <Cell fill={COLORS[0]} />
                          <Cell fill={COLORS[1]} />
                          <Cell fill={COLORS[2]} />
                        </Pie>
                        <Tooltip formatter={(value) => {
                          // Ensure value is a number before using toFixed
                          return typeof value === 'number' ? [`${value.toFixed(1)}%`, 'Percentage'] : [value, 'Percentage'];
                        }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="md:w-1/2 flex flex-col justify-center">
                  <div className="bg-muted/30 rounded-md p-4 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      {getSentimentIcon(sentimentResults.overall.average)}
                      <span className="text-lg font-medium">
                        {getSentimentText(sentimentResults.overall.average)} Overall Sentiment
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      The average sentiment across all reviews leans {getSentimentText(sentimentResults.overall.average).toLowerCase()}, with {sentimentResults.overall.positive.toFixed(1)}% positive and {sentimentResults.overall.negative.toFixed(1)}% negative reviews.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center p-2 bg-green-50 rounded">
                        <Smile className="h-4 w-4 mb-1 text-green-500" />
                        <span className="text-xs text-muted-foreground">Positive</span>
                        <span className="font-medium">{sentimentResults.overall.positive.toFixed(1)}%</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Meh className="h-4 w-4 mb-1 text-gray-500" />
                        <span className="text-xs text-muted-foreground">Neutral</span>
                        <span className="font-medium">{sentimentResults.overall.neutral.toFixed(1)}%</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-red-50 rounded">
                        <Frown className="h-4 w-4 mb-1 text-red-500" />
                        <span className="text-xs text-muted-foreground">Negative</span>
                        <span className="font-medium">{sentimentResults.overall.negative.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-4">Sentiment by Topic</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sentimentResults.byTopic}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 160, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                    <YAxis dataKey="topicLabel" type="category" width={150} />
                    <Tooltip 
                      formatter={(value, name) => {
                        // Ensure value is a number before using toFixed
                        const formattedValue = typeof value === 'number' ? `${value.toFixed(1)}%` : value;
                        const displayName = name === 'positive' ? 'Positive' : name === 'neutral' ? 'Neutral' : 'Negative';
                        return [formattedValue, displayName];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="positive" name="Positive" stackId="a" fill={COLORS[0]} />
                    <Bar dataKey="neutral" name="Neutral" stackId="a" fill={COLORS[1]} />
                    <Bar dataKey="negative" name="Negative" stackId="a" fill={COLORS[2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {sentimentResults.byTopic.map((topic) => (
                  <div key={`topic-sentiment-${topic.topicId}`} className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      {getSentimentIcon(topic.average)}
                      <h4 className="font-medium truncate">{topic.topicLabel}</h4>
                    </div>
                    <div className="mb-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="flex h-full">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${topic.positive}%` }}
                        ></div>
                        <div 
                          className="bg-gray-400" 
                          style={{ width: `${topic.neutral}%` }}
                        ></div>
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${topic.negative}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{topic.positive.toFixed(1)}% positive</span>
                      <span>{topic.neutral.toFixed(1)}% neutral</span>
                      <span>{topic.negative.toFixed(1)}% negative</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleComplete} disabled={!isComplete}>
          Complete NLP Pipeline
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SentimentAnalysisStep;
