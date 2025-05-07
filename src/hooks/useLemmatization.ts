import { ENDPOINTS } from "@/constants/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useLemmatization = (
  fileId: string,
  page: number,
  pageSize: number
) => {
  const queryClient = useQueryClient();
  const queryKey = ["lemmatized", fileId, page];

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axios.get(ENDPOINTS.LEMMATIZE, {
        params: { file_id: fileId, page, page_size: pageSize },
      });

      return {
        before: res.data.data.before,
        after: res.data.data.after,
        total: res.data.data.total_records,
        lemmatized_s3_url: res.data.data.lemmatized_s3_url,
        should_recompute: res.data.data.should_recompute,
      };
    },
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000,
  });

  const { mutateAsync: applyLemmatization, isPending: isApplying } =
    useMutation({
      mutationFn: async () => {
        const res = await axios.post(ENDPOINTS.LEMMATIZE, {
          file_id: fileId,
        });
        return res.data.data;
      },
      onSuccess: () => {
        refetch();
        queryClient.invalidateQueries({ queryKey });
      },
    });

  return {
    data,
    isLoading,
    applyLemmatization,
    isApplying,
  };
};
