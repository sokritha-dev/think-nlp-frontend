// src/hooks/useSampleSentiment.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Papa from "papaparse";

export const useSampleSentiment = (enabled: boolean) => {
  return useQuery({
    queryKey: ["sample-sentiment"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8000/api/pipeline/sample-result");
      return res.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // cache for 5 mins
  });
};

export const useSampleData = () => {
  return useQuery({
    queryKey: ["sample-data"],
    enabled: false, // 🔹 only fetch when refetch is called
    queryFn: async () => {
      const s3UrlResponse = await axios.get("http://localhost:8000/api/pipeline/sample-data-url");
      const url = s3UrlResponse.data.data.s3_url;
      const response = await fetch(url);
      const text = await response.text();
      console.log('response::: ', text)


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
