// useSentimentAnalysis.ts
import { ENDPOINTS } from "@/constants/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface SentimentChartData {
  status: "pending" | "processing" | "done" | "failed";
  should_recompute: boolean;
  overall: {
    positive: number;
    neutral: number;
    negative: number;
  };
  per_topic: {
    label: string;
    positive: number;
    neutral: number;
    negative: number;
    keywords: string[];
  }[];
}

export function useSentimentAnalysis({ topicModelId, algorithm }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isSuccess, isError, error, refetch } =
    useQuery<SentimentChartData>({
      queryKey: ["sentiment-analysis", topicModelId, algorithm],
      queryFn: async () => {
        const res = await axios.get(ENDPOINTS.SENTIMENT_ANALYSIS, {
          params: {
            topic_model_id: topicModelId,
            method: algorithm,
          },
        });
        return res.data.data;
      },
      enabled: !!topicModelId && !!algorithm,
      retry: false,
      refetchInterval: (query) => {
        const data = query.state.data;
        return data?.status === "pending" || data?.status === "processing"
          ? 5000
          : false;
      },
    });

  const notFound =
    isError && axios.isAxiosError(error) && error.response?.status === 404;

  const mutation = useMutation<SentimentChartData>({
    mutationFn: async () => {
      const res = await axios.post(ENDPOINTS.SENTIMENT_ANALYSIS, {
        topic_model_id: topicModelId,
        method: algorithm,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sentiment-analysis", topicModelId, algorithm],
      });
    },
  });

  const status = data?.status; // could be 'pending', 'processing', 'done', or 'failed'

  return {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    notFound,
    status,
    shouldRecompute: data?.should_recompute ?? false,
    runAnalysis: mutation.mutate,
    isRunning: mutation.isPending,
    refetch,
  };
}
