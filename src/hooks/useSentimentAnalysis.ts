// useSentimentAnalysis.ts
import { ENDPOINTS } from "@/constants/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useSentimentAnalysis({ topicModelId, algorithm }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isSuccess, isError, error, refetch } = useQuery({
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
    retry: false, // So we can detect 404 and show the button
  });

  const notFound =
    isError && axios.isAxiosError(error) && error.response?.status === 404;

  const mutation = useMutation({
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

  return {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    notFound,
    shouldRecompute: data?.should_recompute ?? false,
    runAnalysis: mutation.mutate,
    isRunning: mutation.isPending,
    refetch,
  };
}
