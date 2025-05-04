import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ENDPOINTS } from "@/constants/api";

export type NormalizedResult = {
  before: string[];
  after: string[];
  broken_words: string[];
  total: number;
  normalized_s3_url: string;
};

export const useNormalizedReviews = (
  fileId: string,
  page: number = 1,
  pageSize: number = 20
) => {
  const query = useQuery({
    queryKey: ["normalized", fileId, page, pageSize],
    queryFn: async () => {
      const res = await axios.get(`${ENDPOINTS.NORMALIZATION}`, {
        params: {
          file_id: fileId,
          page,
          page_size: pageSize,
        },
      });

      return {
        before: res.data.data.before,
        after: res.data.data.after,
        broken_words: res.data.data.broken_words || [],
        total: res.data.data.total_records,
        normalized_s3_url: res.data.data.normalized_s3_url,
      };
    },
    enabled: !!fileId,
  });

  const mutation = useMutation({
    mutationFn: async (brokenMap: Record<string, string>) => {
      const res = await axios.post(ENDPOINTS.NORMALIZATION, {
        file_id: fileId,
        broken_map: brokenMap,
      });

      return {
        before: res.data.data.before,
        after: res.data.data.after,
        broken_words: res.data.data.broken_words || [],
        total: res.data.data.total_records,
        normalized_s3_url: res.data.data.normalized_s3_url,
      };
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const downloadCSV = async (url: string) => {
    if (!url) return;
    const response = await axios.get(url, { responseType: "blob" });
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "normalized_reviews.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    ...query,
    applyBrokenMap: mutation.mutateAsync,
    isApplying: mutation.isPending,
    downloadCSV,
  };
};
