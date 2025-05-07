import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NormalizationStep from "@/components/data-cleaning-step/NormalizationStep";
import { DataCleaningDefinition } from "@/components/data-cleaning-step/DataCleaningDefinition";
import SpecialCharRemovalStep from "@/components/data-cleaning-step/SpecialCharsRemoveStep";
import TokenizationStep from "@/components/data-cleaning-step/TokenizationStep";
import StopwordRemovalStep from "@/components/data-cleaning-step/StopwordRemovalStep";
import LemmatizationStep from "@/components/data-cleaning-step/LemmatizationStep";

const CLEANING_STEPS = [
  {
    name: "Normalized",
    icon: "🧼",
    description:
      "Fixed broken words, trimmed spaces, and made everything lowercase.",
    badges: [
      { label: "Unicode NFKC", tip: "Normalize special characters." },
      { label: "Contractions", tip: "Expand shortened words." },
      { label: "Whitespace", tip: "Trim and condense spaces." },
      { label: "Lowercase", tip: "Convert all to lowercase." },
    ],
    component: NormalizationStep,
  },
  {
    name: "Special Chars Removed",
    icon: "✂️",
    description: "Removed emojis, numbers, and symbols.",
    badges: [
      { label: "Emoji", tip: "Remove emojis." },
      { label: "Numbers", tip: "Remove digits." },
      { label: "Special Chars", tip: "Remove punctuation, etc." },
    ],
    component: SpecialCharRemovalStep,
  },
  {
    name: "Tokenized",
    icon: "🔠",
    description: "Split the text into individual words or tokens.",
    badges: [
      { label: "Whitespace Split", tip: "Split sentences by spaces." },
      { label: "Lowercase Tokens", tip: "Tokens are made lowercase." },
      {
        label: "Punctuation Removed",
        tip: "Punctuation is dropped from tokens.",
      },
    ],
    component: TokenizationStep,
  },
  {
    name: "Stopwords Removed",
    icon: "🚫",
    badges: [{ label: "NLTK", tip: "Remove stopwords in English language." }],
    description:
      "Removed common words like 'the', 'is', etc, occur very frequently and don't carry much semantic meaning. This process help to reduce the size of data, improve the efficiency of algorithms and enhance the accuracy of text analysis tasks.",
    component: StopwordRemovalStep,
  },
  {
    name: "Lemmatized",
    icon: "🔁",
    badges: [
      {
        label: "WordNetLemmatizer - NLTK",
        tip: "Convert the word into a root form",
      },
    ],
    description:
      "Converted words to their base form. E.g: Improvement, Improving, Improved => Improve",
    component: LemmatizationStep,
  },
];

export default function DataCleaningStep({
  fileId,
  onStepComplete,
}: {
  fileId: string;
  onStepComplete: () => void;
}) {
  const [processStage, setProcessStage] = useState(0);

  const currentStep = CLEANING_STEPS[processStage];
  const StepComponent = currentStep.component;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <DataCleaningDefinition />
          </div>
          <div className="shrink-0">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap"
            >
              Step {processStage + 1}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Step Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {CLEANING_STEPS.map((step, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                onClick={() => setProcessStage(index)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium
                  transition border focus:outline-none
                  ${
                    index === processStage
                      ? "bg-nlp-blue text-white border-nlp-blue"
                      : "bg-muted text-muted-foreground border-border opacity-60"
                  }`}
              >
                <span>{index < processStage ? "✅" : step.icon}</span>
                <span>{step.name}</span>
              </button>
              {index < CLEANING_STEPS.length - 1 && (
                <span className="text-muted-foreground text-xl">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Render current step component */}
        <StepComponent
          fileId={fileId}
          badges={currentStep.badges}
          description={currentStep.description}
        />
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={onStepComplete}>Complete & Continue</Button>
      </CardFooter>
    </Card>
  );
}
