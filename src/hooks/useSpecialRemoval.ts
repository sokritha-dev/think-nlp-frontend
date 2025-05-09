// src/hooks/useSpecialCleanedReviews.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ENDPOINTS } from "@/constants/api";

export type SpecialRemovalResult = {
  before: string[];
  after: string[];
  total: number;
  cleaned_s3_url: string;
  removed_characters: string[];
  flags: {
    remove_special: boolean;
    remove_numbers: boolean;
    remove_emoji: boolean;
  };
  should_recompute: boolean;
};

export type SpecialRemovalConfig = {
  file_id: string;
  remove_special: boolean;
  remove_numbers: boolean;
  remove_emoji: boolean;
};

export const useSpecialRemovalReviews = (
  fileId: string,
  page: number = 1,
  pageSize: number = 20
) => {
  const query = useQuery<SpecialRemovalResult>({
    queryKey: ["special-clean", fileId, page, pageSize],
    queryFn: async () => {
      const res = await axios.get(ENDPOINTS.SPECIAL_REMOVAL, {
        params: { file_id: fileId, page, page_size: pageSize },
      });

      return {
        before: res.data.data.before,
        after: res.data.data.after,
        cleaned_s3_url: res.data.data.cleaned_s3_url,
        removed_characters: res.data.data.removed_characters,
        total: res.data.data.total_records,
        flags: res.data.data.flags,
        should_recompute: res.data.data.should_recompute,
      };
    },
    enabled: !!fileId,
  });

  const mutation = useMutation({
    mutationFn: async (config: SpecialRemovalConfig) => {
      const res = await axios.post(ENDPOINTS.SPECIAL_REMOVAL, config);
      return {
        before: res.data.data.before,
        after: res.data.data.after,
        cleaned_s3_url: res.data.data.cleaned_s3_url,
        removed_characters: res.data.data.removed_characters,
        total: res.data.data.total_records,
        flags: res.data.data.flags,
        should_recompute: res.data.data.should_recompute,
      };
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  return {
    ...query,
    applySpecialClean: mutation.mutateAsync,
    isApplying: mutation.isPending,
  };
};
