import { Smile, Frown, Meh } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

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

type SentimentChartsProps = {
  sentimentResults: SentimentResults;
};

const COLORS = ['#4FD1C5', '#A0AEC0', '#FC8181'];

const getSentimentIcon = (score: number) => {
  if (score > 0.2) return <Smile className="h-5 w-5 text-green-500" />;
  if (score < -0.2) return <Frown className="h-5 w-5 text-red-500" />;
  return <Meh className="h-5 w-5 text-amber-500" />;
};

const getSentimentText = (score: number) => {
  if (score > 0.2) return "Positive";
  if (score < -0.2) return "Negative";
  return "Neutral";
};

export const SentimentCharts = ({ sentimentResults }: SentimentChartsProps) => {
  return (
    <div className="space-y-10">
      {/* Overall Sentiment Distribution */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="md:w-1/2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Positive", value: sentimentResults.overall.positive },
                  { name: "Neutral", value: sentimentResults.overall.neutral },
                  { name: "Negative", value: sentimentResults.overall.negative },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
              </Pie>
              <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="md:w-1/2">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {getSentimentIcon(sentimentResults.overall.average)}
              <h2 className="text-lg font-semibold">
                {getSentimentText(sentimentResults.overall.average)} Overall Sentiment
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              The average sentiment across all reviews leans {getSentimentText(sentimentResults.overall.average).toLowerCase()},
              with {sentimentResults.overall.positive.toFixed(1)}% positive and {sentimentResults.overall.negative.toFixed(1)}% negative reviews.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 rounded p-2 text-center">
                <Smile className="h-4 w-4 mx-auto text-green-500 mb-1" />
                <div className="text-xs text-gray-500">Positive</div>
                <div className="font-semibold text-sm">{sentimentResults.overall.positive.toFixed(1)}%</div>
              </div>
              <div className="bg-gray-50 rounded p-2 text-center">
                <Meh className="h-4 w-4 mx-auto text-gray-500 mb-1" />
                <div className="text-xs text-gray-500">Neutral</div>
                <div className="font-semibold text-sm">{sentimentResults.overall.neutral.toFixed(1)}%</div>
              </div>
              <div className="bg-red-50 rounded p-2 text-center">
                <Frown className="h-4 w-4 mx-auto text-red-500 mb-1" />
                <div className="text-xs text-gray-500">Negative</div>
                <div className="font-semibold text-sm">{sentimentResults.overall.negative.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment by Topic */}
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
                  const labelMap: Record<string, string> = {
                    positive: "Positive",
                    neutral: "Neutral",
                    negative: "Negative"
                  };
                  return [`${(value as number).toFixed(1)}%`, labelMap[name]];
                }}
              />
              <Legend />
              <Bar dataKey="positive" name="Positive" stackId="a" fill={COLORS[0]} />
              <Bar dataKey="neutral" name="Neutral" stackId="a" fill={COLORS[1]} />
              <Bar dataKey="negative" name="Negative" stackId="a" fill={COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Per-topic Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {sentimentResults.byTopic.map((topic) => (
            <div key={topic.topicId} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                {getSentimentIcon(topic.average)}
                <h4 className="font-medium text-sm truncate">{topic.topicLabel}</h4>
              </div>
              <div className="mb-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div className="bg-green-500" style={{ width: `${topic.positive}%` }}></div>
                  <div className="bg-gray-400" style={{ width: `${topic.neutral}%` }}></div>
                  <div className="bg-red-500" style={{ width: `${topic.negative}%` }}></div>
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
  );
};
