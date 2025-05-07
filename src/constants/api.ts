// src/constants/api.ts

export const API_BASE_URL = "http://localhost:8000";

export const ENDPOINTS = {
  SAMPLE_SENTIMENT: `${API_BASE_URL}/api/pipeline/sample-result`,
  SAMPLE_DATA_URL: `${API_BASE_URL}/api/pipeline/sample-data-url`,
  RUN_SENTIMENT_PIPELINE: `${API_BASE_URL}/api/pipeline/sentiment-analysis`,
  UPLOAD_DATA: `${API_BASE_URL}/api/upload`,
  NORMALIZATION: `${API_BASE_URL}/api/clean/normalize`,
  SPECIAL_REMOVAL: `${API_BASE_URL}/api/clean/remove-special`,
  TOKENIZE: `${API_BASE_URL}/api/clean/tokenize`,
  STOPWORD_REMOVAL: `${API_BASE_URL}/api/clean/remove-stopwords`,
  LEMMATIZE: `${API_BASE_URL}/api/clean/lemmatize`,
};
