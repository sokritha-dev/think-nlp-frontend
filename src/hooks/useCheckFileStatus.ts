import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ENDPOINTS } from "@/constants/api";

export const useCheckFileStatus = (fileId: string | null) => {
  return useQuery({
    queryKey: ["check-sample", fileId],
    queryFn: async () => {
      const res = await axios.get(`${ENDPOINTS.STATUS_FILE}`, {
        params: { file_id: fileId },
      });
      return res.data.data.is_sample;
    },
    enabled: !!fileId,
    staleTime: 1000 * 60 * 10, // cache for 10 minutes
  });
};
