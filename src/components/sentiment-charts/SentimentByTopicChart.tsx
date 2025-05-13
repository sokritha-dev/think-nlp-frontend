import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Smile, Meh, Frown, HelpCircle } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COLORS = ["#4FD1C5", "#A0AEC0", "#FC8181"];

type TopicSentiment = {
  label: string;
  positive: number;
  neutral: number;
  negative: number;
  keywords: string[];
};

type Props = {
  data: TopicSentiment[];
};

const getSentimentIcon = (positive: number, negative: number) => {
  const score = (positive - negative) / 100;
  if (score > 0.2) return <Smile className="h-4 w-4 text-green-500" />;
  if (score < -0.2) return <Frown className="h-4 w-4 text-red-500" />;
  return <Meh className="h-4 w-4 text-amber-500" />;
};

export const SentimentByTopicChart = ({ data }: Props) => {
  const roundedData = data.map((topic) => ({
    ...topic,
    positive: parseFloat(topic.positive.toFixed(1)),
    neutral: parseFloat(topic.neutral.toFixed(1)),
    negative: parseFloat(topic.negative.toFixed(1)),
  }));

  return (
    <div className="mt-10">
      <h3 className="text-sm font-medium mb-4">Sentiment by Topic</h3>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={roundedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 160, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(tick) => `${tick.toFixed(0)}%`}
            />
            <YAxis dataKey="label" type="category" width={150} />
            <Tooltip
              formatter={(value, name) => {
                const labelMap: Record<string, string> = {
                  positive: "Positive",
                  neutral: "Neutral",
                  negative: "Negative",
                };
                return [`${(value as number).toFixed(1)}%`, labelMap[name]];
              }}
            />
            <Legend />
            <Bar
              dataKey="positive"
              name="Positive"
              stackId="a"
              fill={COLORS[0]}
            />
            <Bar
              dataKey="neutral"
              name="Neutral"
              stackId="a"
              fill={COLORS[1]}
            />
            <Bar
              dataKey="negative"
              name="Negative"
              stackId="a"
              fill={COLORS[2]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <TooltipProvider>
          {roundedData.map((topic, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                {getSentimentIcon(topic.positive, topic.negative)}
                <span className="font-medium text-sm truncate">
                  {topic.label}
                </span>

                {topic.keywords.length > 0 && (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-600" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-[200px] text-xs text-gray-600">
                        {topic.keywords.join(", ")}
                      </p>
                    </TooltipContent>
                  </UITooltip>
                )}
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
        </TooltipProvider>
      </div>
    </div>
  );
};
