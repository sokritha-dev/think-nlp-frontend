import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Hash,
  Clock,
  Info,
  Download,
  ChevronDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { ENDPOINTS } from "@/constants/api";
import WordCloud from "react-wordcloud";
import html2canvas from "html2canvas";
import ChartLoader from "@/components/loaders/ChartLoader";
import TextLoader from "@/components/loaders/TextLoader";

function generateRandomColors(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i);
    const saturation = 70 + Math.floor(Math.random() * 20);
    const lightness = 50 + Math.floor(Math.random() * 10);
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
}

const COLORS = generateRandomColors(100);

function CollapsibleInfoBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4 border border-gray-200 rounded-md bg-blue-50 p-4 transition-all">
      <button
        className="flex items-center justify-between w-full text-left font-medium text-blue-800"
        onClick={() => setExpanded(!expanded)}
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 transform transition-transform ${
            expanded ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      {expanded && (
        <div className="mt-3 text-sm text-blue-900 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export default function DataExplorationStep({ fileId, onStepComplete }) {
  const [activeTab, setActiveTab] = useState("word-freq");

  const wordFreqRef = useRef(null);
  const bigramRef = useRef(null);
  const trigramRef = useRef(null);
  const lengthRef = useRef(null);
  const cloudRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["eda-summary", fileId],
    queryFn: async () => {
      const res = await axios.post(ENDPOINTS.DATA_EDA, { file_id: fileId });
      if (res.data.status !== "success") throw new Error("Failed to fetch EDA");
      const raw = res.data.data;

      const maxLen = Math.max(...raw.length_distribution.map((d) => d.length));
      const bucketSize = Math.ceil(maxLen / 20 / 10) * 10;

      const bucketedLengths: Record<string, number> = {};
      raw.length_distribution.forEach(({ length, count }) => {
        const bucketStart = Math.floor(length / bucketSize) * bucketSize;
        const bucketEnd = bucketStart + bucketSize - 1;
        const label = `${bucketStart}-${bucketEnd}`;
        bucketedLengths[label] = (bucketedLengths[label] || 0) + count;
      });

      return {
        ...raw,
        full_wordcloud: raw.word_cloud.map((item) => ({
          text: item.text.replace(/^'+|'+$/g, "").replace(/['",]/g, ""),
          value: item.value,
        })),
        top_20_frequent_words: raw.word_cloud.slice(0, 20).map((item) => ({
          word: item.text.replace(/['",]/g, ""),
          count: item.value,
        })),
        bucketed_length_data: Object.entries(bucketedLengths).map(
          ([bucket, count]) => ({ bucket, count })
        ),
      };
    },
    enabled: !!fileId,
  });

  const exportAsImage = async (ref: any, filename: string) => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current);
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const renderVerticalBar = (data: any[], key: string, ref, colorIndex = 0) => (
    <div className="relative">
      <div ref={ref}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={key}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="count"
              isAnimationActive
              animationDuration={800}
              fill={COLORS[colorIndex % COLORS.length]}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => exportAsImage(ref, key)}
        >
          <Download className="w-4 h-4 mr-1" /> Export as Image
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Exploratory Data Analysis (EDA)</CardTitle>
            <CardDescription>
              Visualize the structure and vocabulary in your reviews.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Step 2
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading || !data ? (
          <TextLoader
            topic="Running exploratory data analysis..."
            description="This may take up to 1 minute depending on your dataset."
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="word-freq">
                <BarChart2 className="h-4 w-4 mr-1" /> Word Frequency
              </TabsTrigger>
              <TabsTrigger value="word-cloud">
                <BarChart2 className="h-4 w-4 mr-1" /> Word Cloud
              </TabsTrigger>
              <TabsTrigger value="ngrams">
                <Hash className="h-4 w-4 mr-1" /> N-grams
              </TabsTrigger>
              <TabsTrigger value="length">
                <Clock className="h-4 w-4 mr-1" /> Word Length
              </TabsTrigger>
            </TabsList>

            <TabsContent value="word-freq" className="pt-6">
              <h3 className="text-sm font-medium mb-1">
                Top 20 Most Frequent Words
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This chart shows the most common words in your reviews. Words
                that appear more often may highlight key themes or repetitive
                feedback from users.
              </p>
              {renderVerticalBar(
                data.top_20_frequent_words,
                "word",
                wordFreqRef,
                0
              )}
              <CollapsibleInfoBox title="📌 Why analyze frequent words?">
                <p className="mb-2">
                  Analyzing the most frequent words helps you quickly identify
                  what people are talking about the most.
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Gives an overview of dominant themes</li>
                  <li>
                    Guides downstream tasks like topic modeling or sentiment
                  </li>
                </ul>
              </CollapsibleInfoBox>
            </TabsContent>

            <TabsContent value="word-cloud" className="pt-6">
              <h3 className="text-sm font-medium mb-3">Word Cloud</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The word cloud provides a visual snapshot of word frequency.
                Larger words indicate higher frequency, helping users spot
                trends at a glance.
              </p>
              <div ref={cloudRef} className="h-[360px]">
                <WordCloud
                  words={data.full_wordcloud}
                  options={{
                    rotations: 2,
                    rotationAngles: [0, 90],
                    fontSizes: [12, 40],
                  }}
                />
              </div>
              <div className="mt-2 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportAsImage(cloudRef, "word-cloud")}
                >
                  {" "}
                  <Download className="w-4 h-4 mr-1" /> Export Word Cloud{" "}
                </Button>
              </div>
              <CollapsibleInfoBox title="📌 What is a Word Cloud good for?">
                <p>
                  Word clouds give a quick, intuitive glimpse of what dominates
                  the text. They’re great for presentations or overviews, but
                  shouldn’t replace deeper analysis.
                </p>
              </CollapsibleInfoBox>
            </TabsContent>

            <TabsContent value="ngrams" className="pt-6">
              <h3 className="text-sm font-medium mb-3">
                Top Bigrams and Trigrams
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                N-grams highlight commonly co-occurring words that may represent
                meaningful phrases. Analyzing them helps uncover themes in user
                expression.
              </p>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h4 className="text-xs text-muted-foreground mb-2">
                    Top Bigrams
                  </h4>
                  {renderVerticalBar(data.bigrams, "bigram", bigramRef, 1)}
                </div>
                <div>
                  <h4 className="text-xs text-muted-foreground mb-2">
                    Top Trigrams
                  </h4>
                  {renderVerticalBar(data.trigrams, "trigram", trigramRef, 2)}
                </div>
              </div>
              <CollapsibleInfoBox title="📌 Why analyze N-grams?">
                <p className="mb-2">
                  N-grams help capture context that single words can’t.
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Reveal recurring phrases and patterns</li>
                  <li>Improve performance in classification and search</li>
                  <li>Useful in feature engineering for ML tasks</li>
                </ul>
              </CollapsibleInfoBox>
            </TabsContent>

            <TabsContent value="length" className="pt-6">
              <h3 className="text-sm font-medium mb-3">
                Word Length Distribution
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This chart shows how long words typically are in your data.
                Short words dominate casual reviews, while long words may signal
                more technical or detailed language.
              </p>
              <div ref={lengthRef}>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={data.bucketed_length_data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="bucket"
                      label={{
                        value: "Word Length",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Count",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      isAnimationActive
                      animationDuration={800}
                      fill="#2C5282"
                    >
                      {data.bucketed_length_data.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportAsImage(lengthRef, "word-length")}
                >
                  <Download className="w-4 h-4 mr-1" /> Export Word Length
                </Button>
              </div>
              <CollapsibleInfoBox title="📌 Why is Word Length important?">
                <p>
                  Word length can help estimate language style and complexity.
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Shorter words suggest simpler, casual tone</li>
                  <li>
                    Longer words may indicate formal or domain-specific content
                  </li>
                </ul>
              </CollapsibleInfoBox>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={onStepComplete}>Complete & Continue</Button>
      </CardFooter>
    </Card>
  );
}
