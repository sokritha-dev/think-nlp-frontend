import { ENDPOINTS } from "@/constants/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useStopwordRemoval = (
  fileId: string,
  page: number,
  pageSize: number,
  config: {
    custom_stopwords: string[];
    exclude_stopwords: string[];
  }
) => {
  const queryClient = useQueryClient();

  const queryKey = ["stopword-removal", fileId, page];

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axios.get(ENDPOINTS.STOPWORD_REMOVAL, {
        params: {
          file_id: fileId,
          page,
          page_size: pageSize,
        },
      });

      return {
        before: res.data.data.before,
        after: res.data.data.after,
        stopword_s3_url: res.data.data.stopword_s3_url,
        total: res.data.data.total_records,
        should_recompute: res.data.data.should_recompute,
        config: res.data.data.config,
      };
    },
    enabled: !!fileId,
  });

  const { mutateAsync: applyStopwordRemoval, isPending: isApplying } =
    useMutation({
      mutationFn: async () => {
        const res = await axios.post(ENDPOINTS.STOPWORD_REMOVAL, {
          file_id: fileId,
          custom_stopwords: config.custom_stopwords,
          exclude_stopwords: config.exclude_stopwords,
        });
        return res.data.data;
      },
      onSuccess: (updatedData) => {
        // 1. Instantly update the UI
        queryClient.setQueryData(queryKey, updatedData);

        // 2. Optionally mark it stale in background
        queryClient.invalidateQueries({
          queryKey,
        });
      },
    });

  return {
    data,
    isLoading,
    applyStopwordRemoval,
    isApplying,
  };
};
