import { Info } from "lucide-react";

export const DataCleaningDefinition = () => (
  <div className="mb-6">
    <div className="flex gap-2 items-start mb-2">
      <Info className="h-5 w-5 text-blue-700 mt-0.5" />
      <h3 className="font-medium text-nlp-blue">What is Data Cleaning?</h3>
    </div>
    <p className="text-sm text-muted-foreground">
      Data cleaning is the process of fixing messy, raw text to make it neat and
      ready for analysis. It helps improve results in tasks like NLP by making
      the data clearer for models to understand. Belows is the common flows of
      data cleaning:
    </p>
  </div>
);
