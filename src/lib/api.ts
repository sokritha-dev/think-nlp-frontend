// src/lib/api.ts
import { ENDPOINTS } from "@/constants/api";
import { SentimentResults } from "@/hooks/useSampleSentiment";
import axios from "axios";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(ENDPOINTS.UPLOAD_DATA, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const runSentimentPipeline = async (fileId: string) => {
  return axios.post<{ data: SentimentResults }>(
    ENDPOINTS.RUN_SENTIMENT_PIPELINE,
    {
      file_id: fileId,
    }
  );
};
