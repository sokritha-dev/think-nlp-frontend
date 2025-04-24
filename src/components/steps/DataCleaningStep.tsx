import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const defaultStopWords = new Set(["the", "and", "is", "in", "at", "of", "a", "to", "for", "with"]);

const lemmatizationMap: Record<string, string> = {
  running: "run", walked: "walk", eating: "eat",
  services: "service", customers: "customer", products: "product"
};

const normalizationBadges = [
  { label: "Unicode NFKC", tip: "Normalizes accented or full-width characters to standard format." },
  { label: "Contractions", tip: "Expands text like 'isn't' to 'is not'." },
  { label: "RegEx Whitespace", tip: "Removes extra spaces, tabs, line breaks using regex." },
  { label: "Lowercase", tip: "Converts all text to lowercase for consistency." },
];

const removeSpecialCharBadges = [
  { label: "Emoji", tip: "Remove Emoji." },
  { label: "RegEx Whitespace", tip: "Removes special character and numbers." },
];

const tokenizeBadges = [
  { label: "NLTK", tip: "Supports classification, tokenization, stemming, tagging, parsing, and more." },
];

const CleaningBadgeSection = ({ title, badges }: { title: string; badges: { label: string; tip: string; }[] }) => (
  <div className="flex flex-col gap-1 mb-2">
    <span className="text-xs text-muted-foreground font-medium">{title}</span>
    <div className="flex flex-wrap gap-1">
      {badges.map((b, idx) => (
        <TooltipProvider key={idx}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Badge variant="outline" className="cursor-help">{b.label}</Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent>{b.tip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  </div>
);

const DataCleaningDefinition = () => {
  return (
    <div className="mb-6">
      <div className="flex gap-2 items-start mb-2">
        <Info className="h-5 w-5 text-blue-700 mt-0.5" />
        <h3 className="font-medium text-nlp-blue">What is Data Cleaning?</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Data cleaning is the process of fixing messy, raw text to make it neat and ready for analysis. It helps improve results in tasks like natural language processing (NLP) by making the data clearer for models to understand. Below is the common flow in data cleaning for text data:
      </p>
    </div>
  )
}

export default function DataCleaningStep({ rawData, onStepComplete }: {
  rawData: string;
  onStepComplete: (cleanedData: string[]) => void;
}) {
  const [processStage, setProcessStage] = useState(0);
  const [customStopwords, setCustomStopwords] = useState("");
  const [brokenMapInput, setBrokenMapInput] = useState(null);
  const [brokenMap, setBrokenMap] = useState<Record<string, string>>({});
  const [removeSpecialChars, setRemoveSpecialChars] = useState(true);
  const [removeNumbers, setRemoveNumbers] = useState(true);
  const [removeEmojis, setRemoveEmojis] = useState(true);

  const reviews = rawData.split(/\n+/).filter(line => line.trim());
  const normalized = reviews.map(r => {
    let cleaned = r.trim();
    Object.entries(brokenMap).forEach(([key, val]) => {
      const regex = new RegExp(`\\b${key}\\b`, "gi");
      cleaned = cleaned.replace(regex, val);
    });
    return cleaned;
  });

  const noSpecialChars = normalized.map(r => {
    let cleaned = r;
    if (removeEmojis) cleaned = cleaned.replace(/([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}])/gu, '');
    if (removeNumbers) cleaned = cleaned.replace(/[0-9]/g, '');
    if (removeSpecialChars) cleaned = cleaned.replace(/[^\w\s']|_/g, '');
    return cleaned.replace(/\s+/g, ' ');
  });

  const tokenized = noSpecialChars.map(r => r.toLowerCase().split(" "));
  const userStopwords = customStopwords.split(',').map(s => s.trim()).filter(Boolean);
  const mergedStopwords = new Set([...defaultStopWords, ...userStopwords]);
  const withoutStopwords = tokenized.map(tokens => tokens.filter(t => !mergedStopwords.has(t) && t.length > 1));
  const lemmatized = withoutStopwords.map(tokens => tokens.map(t => lemmatizationMap[t] || t));
  const cleaned = lemmatized.map(t => t.join(" "));

  const inputsPerStep: Record<number, JSX.Element | null> = {
    0: (
      <div className="space-y-2 mb-4">
        <label className="text-xs text-muted-foreground font-medium">Broken Word Map (word=replacement)</label>
        <input
          value={brokenMapInput}
          placeholder="word1=correct1, word2=correct2"
          onChange={(e) => setBrokenMapInput(e.target.value)}
          className="border px-3 py-1 rounded-md text-sm w-full"
        />
        <Button size="sm" className="text-xs w-full" onClick={() => {
          const map: Record<string, string> = {};
          brokenMapInput.split(',').forEach(pair => {
            const [k, v] = pair.split('=');
            if (k && v) map[k.trim()] = v.trim();
          });
          setBrokenMap(map);
        }}>
          Apply Changing
        </Button>
      </div>
    ),
    1: (
      <div className="space-y-2 mb-4">
        <label className="text-xs text-muted-foreground font-medium">Character types to remove:</label>
        <div className="flex gap-4 flex-wrap text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={removeSpecialChars} onChange={() => setRemoveSpecialChars(!removeSpecialChars)} />
            Special Characters
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={removeNumbers} onChange={() => setRemoveNumbers(!removeNumbers)} />
            Numbers
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={removeEmojis} onChange={() => setRemoveEmojis(!removeEmojis)} />
            Emojis
          </label>
        </div>
        <Button size="sm" className="text-xs w-full">
          Apply Changing
        </Button>
      </div>
    ),
    3: (
      <div className="space-y-2 mb-4">
        <label className="text-xs text-muted-foreground font-medium">Custom Words (Words that want to remove beside stopwords.)</label>
        <input
          value=""
          placeholder="word1, word2, word3"
          onChange={(e) => { }}
          className="border px-3 py-1 rounded-md text-sm w-full"
        />
        <div className="mb-2" />
        <label className="text-xs text-muted-foreground font-medium">Exclude stopwords (Stopwords that want to keep not getting removed. You can check more the stopwords: {<a href="https://countwordsfree.com/stopwords" className="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline" target="_blank">link</a>})</label>
        <input
          value=""
          placeholder="word1, word2, word3"
          onChange={(e) => { }}
          className="border px-3 py-1 rounded-md text-sm w-full"
        />
        <Button size="sm" className="text-xs w-full">
          Apply Changing
        </Button>
      </div>
    ),
  };

  const stepData = [
    { name: "Normalized", icon: "🧼", data: normalized, badges: normalizationBadges, description: "Fixed broken words, trimmed spaces, and made everything lowercase." },
    { name: "Special Chars Removed", icon: "✂️", data: noSpecialChars, badges: removeSpecialCharBadges, description: "Removed emojis, numbers, and symbols." },
    { name: "Tokenized", icon: "🔠", data: tokenized.map(t => t.join(" ")), badges: tokenizeBadges, description: "Break text into smaller parts for easier machine analysis." },
    { name: "Stopwords Removed", icon: "🚫", data: withoutStopwords.map(t => t.join(" ")), badges: [], description: "Removed common words like 'the', 'is', etc, occur very frequently and don't carry much semantic meaning. This process help to reduce the size of data, improve the efficiency of algorithms and enhance the accuracy of text analysis tasks." },
    { name: "Lemmatized", icon: "🔁", data: cleaned, badges: [], description: "Converted words to their base form. E.g: Improvement, Improving, Improved => Improve" }
  ];

  const current = stepData[processStage];
  const before = processStage === 0 ? reviews : stepData[processStage - 1].data;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Data Cleaning</CardTitle>
            <CardDescription>
              Prepare text data for analysis by cleaning and normalizing
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Step 1
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <DataCleaningDefinition />

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {stepData.map((step, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                onClick={() => setProcessStage(index)}
                className={`
          flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium
          transition border focus:outline-none
          ${index === processStage
                    ? "bg-nlp-blue text-white border-nlp-blue"
                    : index < processStage
                      ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                      : "bg-muted text-muted-foreground border-border opacity-60"}
        `}
              >
                <span>{index < processStage ? "✅" : step.icon}</span>
                <span className="truncate">{step.name}</span>
              </button>

              {index < stepData.length - 1 && (
                <span className="text-muted-foreground text-xl">→</span>
              )}
            </div>
          ))}
        </div>

        {/* ==================== Definition of Each Step ===================== */}
        <div>
          <span className="text-xs text-muted-foreground font-medium">Definitions</span>
          <p className="text-sm text-muted-foreground font-normal mb-4">
            {stepData[processStage].description}
          </p>
        </div>


        {/* ==================== Library Used ===================== */}
        {stepData[processStage].badges.length > 0 && (
          <CleaningBadgeSection
            title="Techniques used:"
            badges={stepData[processStage].badges}
          />)}

        {/* ==================== Parameter Configuration ===================== */}
        {inputsPerStep[processStage] ?? null}

        {/* ==================== Input & Output Data ========================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 rounded-xl p-5 h-80 overflow-y-auto border border-border shadow-sm">
          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground border-b pb-1">Before</h4>
            <div className="space-y-2">
              {before.map((text: string, i: number) => <div key={i} className="text-sm bg-white/50 p-2 rounded-md border border-dashed">{text}</div>)}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 text-nlp-blue border-b pb-1">After</h4>
            <div className="space-y-2">
              {current.data.map((text: string, i: number) => <div key={i} className="text-sm bg-white p-2 rounded-md border border-solid">{text}</div>)}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={() => { onStepComplete(cleaned); }}>Complete & Continue</Button>
      </CardFooter>
    </Card>
  );
}
