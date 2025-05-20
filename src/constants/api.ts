// src/constants/api.ts

export const API_BASE_URL = process.env.VITE_BACKEND_URL;

export const ENDPOINTS = {
  SENTIMENT_RESULT: `${API_BASE_URL}/api/pipeline/result`,
  SAMPLE_DATA_URL: `${API_BASE_URL}/api/pipeline/sample-data-url`,
  RUN_SENTIMENT_PIPELINE: `${API_BASE_URL}/api/pipeline/sentiment-analysis`,
  UPLOAD_DATA: `${API_BASE_URL}/api/upload`,
  NORMALIZATION: `${API_BASE_URL}/api/clean/normalize`,
  SPECIAL_REMOVAL: `${API_BASE_URL}/api/clean/remove-special`,
  TOKENIZE: `${API_BASE_URL}/api/clean/tokenize`,
  STOPWORD_REMOVAL: `${API_BASE_URL}/api/clean/remove-stopwords`,
  LEMMATIZE: `${API_BASE_URL}/api/clean/lemmatize`,
  DATA_CLEANING_STATUS: `${API_BASE_URL}/api/clean/status`,
  DATA_EDA: `${API_BASE_URL}/api/eda/summary`,
  TOPIC_LDA: `${API_BASE_URL}/api/topic/lda`,
  TOPIC_LABEL: `${API_BASE_URL}/api/topic/label`,
  SENTIMENT_ANALYSIS: `${API_BASE_URL}/api/sentiment/`,
  STATUS_FILE: `${API_BASE_URL}/api/file/status`,
};
