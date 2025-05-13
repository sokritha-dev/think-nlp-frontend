// src/hooks/useSampleSentiment.ts

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ENDPOINTS } from "@/constants/api";
import Papa from "papaparse";

export type SentimentResults = {
  file_id: string;
  overall: {
    positive: number;
    neutral: number;
    negative: number;
  };
  per_topic: {
    label: string;
    keywords: string[];
    positive: number;
    neutral: number;
    negative: number;
  }[];
};

type SampleDataUrl = {
  s3_url: string;
};

export const useSentimentResult = (fileId: string | null) => {
  return useQuery<SentimentResults>({
    queryKey: ["sentiment-result", fileId],
    queryFn: async () => {
      const res = await axios.get<{ data: SentimentResults }>(
        `${ENDPOINTS.SENTIMENT_RESULT}`,
        {
          params: { file_id: fileId },
        }
      );
      return res.data.data;
    },
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSampleData = () => {
  return useQuery<any[]>({
    queryKey: ["sample-data"],
    enabled: false, // 🔹 only fetch when refetch is called
    queryFn: async () => {
      const s3UrlResponse = await axios.get<{ data: SampleDataUrl }>(
        ENDPOINTS.SAMPLE_DATA_URL
      );
      const response = await axios.get(s3UrlResponse.data.data.s3_url);

      const text = response.data;

      return new Promise<any[]>((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as any[]),
          error: reject,
        });
      });
    },
  });
};
