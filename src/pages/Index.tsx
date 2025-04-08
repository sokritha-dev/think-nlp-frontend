
import { useState } from "react";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import NLPStepTabs from "@/components/NLPStepTabs";

const Index = () => {
  const [reviewData, setReviewData] = useState<string | null>(null);

  const handleFileUpload = (data: string) => {
    setReviewData(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        {!reviewData ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-4 text-nlp-blue">
                Welcome to Review Whisperer NLP Lab
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Learn natural language processing by analyzing your own review data
              </p>
              <p className="text-muted-foreground">
                Upload your review data or use our sample dataset to get started.
              </p>
            </div>
            
            <FileUpload onFileUpload={handleFileUpload} />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="text-nlp-teal text-lg font-medium mb-2">Step-by-Step Learning</div>
                <p className="text-sm text-gray-600">
                  Follow a structured workflow through each step of the NLP process from data cleaning to sentiment analysis.
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="text-nlp-teal text-lg font-medium mb-2">Interactive Visualizations</div>
                <p className="text-sm text-gray-600">
                  See your data transformed through visualizations that make complex NLP concepts easier to understand.
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="text-nlp-teal text-lg font-medium mb-2">Real-World Application</div>
                <p className="text-sm text-gray-600">
                  Apply industry-standard techniques to extract meaningful insights from customer reviews and feedback.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <NLPStepTabs reviewData={reviewData} />
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Review Whisperer NLP Lab • Educational Tool for Natural Language Processing
        </div>
      </footer>
    </div>
  );
};

export default Index;
