// src/hooks/useNumTopics.ts
import { useEffect, useState } from "react";

const STORAGE_KEY = "thinkNLP_numTopics";

export function useNumTopics(defaultValue = 4) {
  const [numTopics, setNumTopics] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(numTopics));
  }, [numTopics]);

  return [numTopics, setNumTopics] as const;
}
