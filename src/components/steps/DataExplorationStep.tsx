
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Info, BarChart2, Hash, Clock } from "lucide-react";
import { CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

type DataExplorationStepProps = {
  cleanedData: string[];
  onStepComplete: () => void;
};

const DataExplorationStep = ({ cleanedData, onStepComplete }: DataExplorationStepProps) => {
  const [activeTab, setActiveTab] = useState("word-freq");

  // Word frequency analysis
  const wordFrequency: Record<string, number> = {};
  cleanedData.forEach(review => {
    const words = review.split(" ");
    words.forEach(word => {
      if (word) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
  });

  // Sort words by frequency for visualization
  const wordFreqData = Object.entries(wordFrequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Word length distribution
  const wordLengths: Record<number, number> = {};
  Object.keys(wordFrequency).forEach(word => {
    const length = word.length;
    wordLengths[length] = (wordLengths[length] || 0) + 1;
  });

  const wordLengthData = Object.entries(wordLengths)
    .map(([length, count]) => ({ length: Number(length), count }))
    .sort((a, b) => a.length - b.length);

  // N-gram analysis (bigrams)
  const bigrams: Record<string, number> = {};
  cleanedData.forEach(review => {
    const words = review.split(" ");
    if (words.length < 2) return;
    
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i] && words[i+1]) {
        const bigram = `${words[i]} ${words[i+1]}`;
        bigrams[bigram] = (bigrams[bigram] || 0) + 1;
      }
    }
  });

  const bigramData = Object.entries(bigrams)
    .map(([bigram, count]) => ({ bigram, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Generate a word cloud data
  const wordCloudData = wordFreqData.map(item => ({
    text: item.word,
    value: item.count,
  }));

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  const handleComplete = () => {
    onStepComplete();
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Data Exploration</CardTitle>
            <CardDescription>
              Discover patterns and insights in your text data
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Step 2
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="nlp-explanation mb-6">
          <div className="flex gap-2 items-start mb-2">
            <Info className="h-5 w-5 text-blue-700 mt-0.5" />
            <h3 className="font-medium text-nlp-blue">What is Data Exploration?</h3>
          </div>
          <p className="mb-2">
            Data exploration helps us understand the characteristics and patterns within our text data:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Word frequency analysis reveals the most common terms</li>
            <li>Word length distribution shows complexity of language</li>
            <li>N-gram analysis identifies common phrases and word combinations</li>
            <li>Visual representations make patterns easier to identify</li>
          </ul>
          <p className="mt-2">
            These insights help guide the next steps of your NLP pipeline and identify potential areas for further cleaning or focus.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="word-freq" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Word Frequency</span>
            </TabsTrigger>
            <TabsTrigger value="ngrams" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <span>N-grams</span>
            </TabsTrigger>
            <TabsTrigger value="word-length" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Word Length</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="word-freq" className="pt-4">
            <h3 className="text-sm font-medium mb-4">Top 20 Most Frequent Words</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wordFreqData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="word" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value} occurrences`, 'Frequency']} />
                  <Bar dataKey="count" fill="#38B2AC">
                    {wordFreqData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-4">Word Distribution</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wordFreqData.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="word"
                      label={({ word, percent }) => `${word} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {wordFreqData.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} occurrences`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ngrams" className="pt-4">
            <h3 className="text-sm font-medium mb-4">Top 15 Most Common Bigrams (Two-Word Combinations)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bigramData} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="bigram" type="category" width={140} />
                  <Tooltip formatter={(value) => [`${value} occurrences`, 'Frequency']} />
                  <Bar dataKey="count" fill="#4FD1C5">
                    {bigramData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Bigrams help identify common phrases and patterns in your reviews. These combinations often reveal specific aspects or features being mentioned together.
            </p>
          </TabsContent>
          
          <TabsContent value="word-length" className="pt-4">
            <h3 className="text-sm font-medium mb-4">Word Length Distribution</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wordLengthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="length" label={{ value: 'Word Length (characters)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Number of Words', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value, name, props) => [`${value} words`, `Length: ${props.payload.length} chars`]} />
                  <Bar dataKey="count" fill="#2C5282">
                    {wordLengthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Word length distribution can indicate the complexity of language used in reviews. Shorter words are typically more common, while specialized terminology tends to be longer.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleComplete}>Complete & Continue</Button>
      </CardFooter>
    </Card>
  );
};

export default DataExplorationStep;
