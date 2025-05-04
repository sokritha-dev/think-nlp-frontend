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

export const useSampleSentiment = (enabled: boolean) => {
  return useQuery<SentimentResults>({
    queryKey: ["sample-sentiment"],
    queryFn: async () => {
      const res = await axios.get<{ data: SentimentResults }>(
        ENDPOINTS.SAMPLE_SENTIMENT
      );
      return res.data.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
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
