import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { ENDPOINTS } from "@/constants/api";

interface PayloadTopicLabeling {
  topic_model_id: string;
  keywords?: string[];
  label_map?: Record<string, string>;
}

export function useTopicLabeling({
  topicModelId,
  mode,
  keywords,
  labelMap,
}: {
  topicModelId: string;
  mode: "auto" | "keywords" | "map";
  keywords: string;
  labelMap: Record<string, string>;
}) {
  const [hasLabeled, setHasLabeled] = useState(false);

  const query = useQuery({
    queryKey: ["topic-labeling", topicModelId],
    queryFn: async () => {
      const res = await axios.get(
        `${ENDPOINTS.TOPIC_LABEL}?topic_model_id=${topicModelId}`
      );
      if (res.data.status !== "success")
        throw new Error("Failed to fetch labels");
      return res.data.data;
    },
    enabled: !!topicModelId && !hasLabeled,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: PayloadTopicLabeling = { topic_model_id: topicModelId };
      if (mode === "keywords") {
        payload.keywords = keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k);
      } else if (mode === "map") {
        payload.label_map = labelMap;
      }
      const res = await axios.post(ENDPOINTS.TOPIC_LABEL, payload);
      if (res.data.status !== "success")
        throw new Error("Topic labeling failed");
      setHasLabeled(true);
      return res.data.data;
    },
  });

  return {
    data: mutation.data || query.data,
    isPending: mutation.isPending || query.isFetching,
    isSuccess: mutation.isSuccess || query.isSuccess,
    runLabeling: mutation.mutate,
  };
}
