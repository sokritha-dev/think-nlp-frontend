import { ENDPOINTS } from "@/constants/api";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface CleaningStepStatus {
  step:
    | "normalized"
    | "special_chars"
    | "tokenized"
    | "stopwords"
    | "lemmatized";
  should_recompute: boolean;
}

export interface CleaningStatusResponse {
  steps: CleaningStepStatus[];
}

export function useCleaningStatus(fileId: string, enabled = true) {
  return useQuery<CleaningStatusResponse>({
    queryKey: ["cleaning-status", fileId],
    queryFn: async () => {
      const res = await axios.get(ENDPOINTS.DATA_CLEANING_STATUS, {
        params: { file_id: fileId },
      });
      return res.data.data; // assuming your success_response wraps it inside `data`
    },
    enabled: !!fileId && enabled,
    staleTime: 1000 * 10, // 10 seconds
  });
}
