import { Smile, Meh, Frown } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#4FD1C5", "#A0AEC0", "#FC8181"];

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

type Props = {
  positive: number;
  neutral: number;
  negative: number;
};

export const SentimentOverallChart = ({
  positive,
  neutral,
  negative,
}: Props) => {
  const score = (positive - negative) / 100;
  const sentimentText = getSentimentText(score);
  const sentimentIcon = getSentimentIcon(score);

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center">
      <div className="md:w-1/2 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: "Positive", value: positive },
                { name: "Neutral", value: neutral },
                { name: "Negative", value: negative },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(1)}%)`
              }
            >
              {COLORS.map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${(value as number).toFixed(1)}%`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="md:w-1/2">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            {sentimentIcon}
            <h2 className="text-lg font-semibold">
              {sentimentText} Overall Sentiment
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            The average sentiment across all reviews leans{" "}
            {sentimentText.toLowerCase()}, with {positive.toFixed(1)}% positive
            and {negative.toFixed(1)}% negative reviews.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded p-2 text-center">
              <Smile className="h-4 w-4 mx-auto text-green-500 mb-1" />
              <div className="text-xs text-gray-500">Positive</div>
              <div className="font-semibold text-sm">
                {positive.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <Meh className="h-4 w-4 mx-auto text-gray-500 mb-1" />
              <div className="text-xs text-gray-500">Neutral</div>
              <div className="font-semibold text-sm">{neutral.toFixed(1)}%</div>
            </div>
            <div className="bg-red-50 rounded p-2 text-center">
              <Frown className="h-4 w-4 mx-auto text-red-500 mb-1" />
              <div className="text-xs text-gray-500">Negative</div>
              <div className="font-semibold text-sm">
                {negative.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
