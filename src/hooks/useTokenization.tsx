import { ENDPOINTS } from "@/constants/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useTokenizedReviews = (
  fileId: string,
  page: number,
  pageSize: number
) => {
  const queryClient = useQueryClient();

  const queryKey = ["tokenized-reviews", fileId, page];

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axios.get(ENDPOINTS.TOKENIZE, {
        params: { file_id: fileId, page, page_size: pageSize },
      });
      return {
        before: res.data.data.before,
        after: res.data.data.after,
        tokenized_s3_url: res.data.data.tokenized_s3_url,
        total: res.data.data.total_records,
        should_recompute: res.data.data.should_recompute,
      };
    },
    enabled: !!fileId,
  });

  const { mutateAsync: regenerate, isPending: isRegenerating } = useMutation({
    mutationFn: async () => {
      const res = await axios.post(ENDPOINTS.TOKENIZE, { file_id: fileId });
      return res.data.data;
    },
    onSuccess: (updatedData) => {
      // refetch();

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
    regenerate,
    isRegenerating,
  };
};
