import { useEffect, useState } from "react";

const MESSAGES = [
  "✨ Unleashing the power of NLP...",
  "🧠 Teaching AI to feel your reviews...",
  "📚 Reading reviews like a literature professor...",
  "😅 Even AI needs time to digest all this emotion...",
  "🕵️ Analyzing sentiment with laser precision...",
  "🤖 Asking robots how they feel about your data...",
  "💬 Extracting opinions, one token at a time...",
  "🔍 Looking for angry words (and calm ones too)...",
  "🥱 Our AI skipped coffee today... please be patient!",
  "🚀 Launching insights in 3... 2... 1...",
  "🧘 Breathing deeply before diving into sentiment...",
  "🎯 Hitting the emotional bullseye...",
  "💡 Crunching thoughts into insights...",
  "🐢 Slower than ChatGPT, but deeper than deep learning...",
];

export const useLoadingMessages = (intervalMs: number = 4000) => {
  const [message, setMessage] = useState<string>(() => {
    return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage((prev) => {
        let next;
        do {
          next = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        } while (next === prev);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return message;
};
