import { useEffect, useMemo, useState } from "react";
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
import { useCleaningStatus } from "@/hooks/useCleaningStatus";
import Joyride from "react-joyride";
import React from "react";

const CLEANING_STEPS = [
  {
    name: "Normalized",
    icon: "🧼",
    description:
      "Standardized the text by fixing broken words, trimming extra spaces, and converting everything to lowercase.",
    badges: [
      {
        label: "Unicode NFKC",
        tip: "Standardizes visually similar characters (like full-width 'Ａ' to normal 'A') and combines characters (like 'e' + accent to 'é') into a consistent format for easier processing.",
      },
      {
        label: "Contractions",
        tip: "Expands shortened words like “don’t” to “do not” to preserve meaning in analysis.",
      },
      {
        label: "Whitespace",
        tip: "Removes unnecessary spaces and ensures consistent spacing between words.",
      },
      {
        label: "Lowercase",
        tip: "Converts all characters to lowercase to reduce duplicate tokens like 'Apple' and 'apple'.",
      },
    ],
    component: NormalizationStep,
  },
  {
    name: "Special Chars Removed",
    icon: "✂️",
    description:
      "Cleaned the text by removing emojis, numbers, and special symbols that don’t contribute to core meaning.",
    badges: [
      {
        label: "Emoji",
        tip: "Removes emojis to keep the text focused on meaningful words.",
      },
      {
        label: "Numbers",
        tip: "Removes numerical digits unless they're important for context (e.g., dates, prices).",
      },
      {
        label: "Special Chars",
        tip: "Eliminates punctuation and symbols like %, $, &, which are often considered noise.",
      },
    ],
    component: SpecialCharRemovalStep,
  },
  {
    name: "Tokenized",
    icon: "🔠",
    description:
      "Split the text into individual words or tokens for further analysis.",
    badges: [
      {
        label: "Whitespace Split",
        tip: "Divides text into words based on spaces. For example, 'I love NLP' becomes ['I', 'love', 'NLP'].",
      },
      {
        label: "Punctuation Removed",
        tip: "Strips punctuation marks from tokens like commas and periods.",
      },
    ],
    component: TokenizationStep,
  },
  {
    name: "Stopwords Removed",
    icon: "🚫",
    description:
      "Removed very common words like 'the', 'is', and 'in' that usually add little meaning to analysis.",
    badges: [
      {
        label: "NLTK",
        tip: "Uses the NLTK stopword list to remove frequently occurring English words that do not contribute much meaning.",
      },
    ],
    component: StopwordRemovalStep,
  },
  {
    name: "Lemmatized",
    icon: "🔁",
    description:
      "Converted words to their root forms. For example, 'improving', 'improved', and 'improvement' all become 'improve'.",
    badges: [
      {
        label: "WordNetLemmatizer - NLTK",
        tip: "Uses NLTK’s WordNet to find the base form of each word (lemma), improving consistency across word variations.",
      },
    ],
    component: LemmatizationStep,
  },
];

export default function DataCleaningStep({
  fileId,
  onStepComplete,
  isSample,
}: {
  fileId: string;
  onStepComplete: () => void;
  isSample: boolean;
}) {
  const [processStage, setProcessStage] = useState(0);
  const currentStep = CLEANING_STEPS[processStage];
  const StepComponent = currentStep.component;
  const [runTour, setRunTour] = useState(() => {
    return localStorage.getItem("seenDataCleaningTour") !== "true";
  });

  const { data: statusData, refetch } = useCleaningStatus(fileId, true);

  const steps = [
    {
      target: ".step-button-0",
      title: "Normalization",
      content:
        "We’ll start by standardizing your text—fixing typos, trimming extra spaces, and converting everything to lowercase. This ensures clean, consistent input for downstream tasks.",
    },
    {
      target: ".step-button-1",
      title: "Remove Special Characters",
      content:
        "Next, we strip out non-essential elements like emojis, numbers, and symbols. This reduces noise and focuses the analysis on meaningful language.",
    },
    {
      target: ".step-button-2",
      title: "Tokenization",
      content:
        "Text is then split into individual tokens (typically words). This enables us to analyze word-level patterns and perform tasks like filtering or lemmatization.",
    },
    {
      target: ".step-button-3",
      title: "Stopword Removal",
      content:
        "Common words such as 'the', 'is', or 'and'—which usually carry minimal semantic value—are removed. This helps models focus on the more informative terms.",
    },
    {
      target: ".step-button-4",
      title: "Lemmatization",
      content:
        "We reduce words to their base forms (e.g., 'running' → 'run'). This enhances consistency across variations and improves model generalization.",
    },
    {
      target: ".CompleteContinue",
      content:
        "That’s it! You’ve completed the data cleaning phase. Click below to proceed to the next step in the NLP pipeline.",
    },
  ];

  const recomputeStates = useMemo(() => {
    return (
      statusData?.steps.map((step) => step.should_recompute) ??
      Array(CLEANING_STEPS.length).fill(false)
    );
  }, [statusData]);

  const canProceedToNextStep = useMemo(() => {
    return (
      statusData?.steps.every((s) => s.should_recompute === false) ?? false
    );
  }, [statusData]);

  return (
    <React.Fragment>
      <Joyride
        steps={steps}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        run={runTour}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish", // 👈 Rename 'Last' to 'Finish' or any label
          next: "Next",
          skip: "Skip",
        }}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: "#2563eb",
            textColor: "#1f2937",
            backgroundColor: "white",
            arrowColor: "white",
            overlayColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: 10,
            width: 360,
          },

          tooltipTitle: {
            fontSize: "15px",
            fontWeight: 600,
            textAlign: "left",
          },
          tooltipContent: {
            fontSize: "13px",
            lineHeight: "1.4",
            textAlign: "left",
            padding: "10px 0px",
          },
          buttonNext: {
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: 600,
            fontSize: "13px",
            padding: "6px 14px",
            borderRadius: "5px",
          },
          buttonBack: {
            marginRight: 6,
            fontSize: "13px",
            color: "#6b7280",
            fontWeight: 500,
          },
          buttonClose: {
            top: 6,
            right: 6,
            fontSize: "4px",
            color: "#9ca3af",
            padding: "10px",
          },
        }}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            localStorage.setItem("seenDataCleaningTour", "true");
          }
        }}
      />

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
            {CLEANING_STEPS.map((step, index) => {
              const firstRecomputeIndex = recomputeStates.findIndex(
                (v) => v === true
              );
              const isBlocked =
                firstRecomputeIndex !== -1 && index > firstRecomputeIndex;

              return (
                <div key={index} className="flex items-center gap-2">
                  <button
                    disabled={isBlocked}
                    onClick={() => {
                      if (!isBlocked) setProcessStage(index);
                    }}
                    className={`step-button-${index} flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition border focus:outline-none
                    ${
                      index === processStage
                        ? "bg-nlp-blue text-white border-nlp-blue"
                        : isBlocked
                        ? "bg-muted text-muted-foreground border-border opacity-30 cursor-not-allowed"
                        : "bg-muted text-muted-foreground border-border opacity-60"
                    }`}
                  >
                    <span>{index < processStage ? "✅" : step.icon}</span>
                    <span>{step.name}</span>
                  </button>
                  {index < CLEANING_STEPS.length - 1 && (
                    <span
                      className={`text-xl transition ${
                        index === processStage && !recomputeStates[index + 1]
                          ? "animate-arrow-glow"
                          : "text-muted-foreground"
                      }`}
                    >
                      →
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Body */}
          <StepComponent
            fileId={fileId}
            badges={currentStep.badges}
            description={currentStep.description}
            refetchStatus={refetch}
            isSample={isSample}
          />
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            onClick={onStepComplete}
            disabled={!canProceedToNextStep}
            className="CompleteContinue"
          >
            Complete & Continue
          </Button>
        </CardFooter>
      </Card>
      <div className="flex justify-end mt-2">
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              localStorage.removeItem("seenDataCleaningTour");
              setRunTour(false);
              setTimeout(() => setRunTour(true), 100); // restart cleanly
            }}
          >
            🧭 Restart Tour
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
}
