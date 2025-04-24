// src/pages/Steps.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import NLPStepTabs from "@/components/NLPStepTabs";
import { Button } from "@/components/ui/button";

const StepsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { reviewData?: string };
    if (state?.reviewData) {
      setReviewData(state.reviewData);
    } else {
      navigate("/", { replace: true }); // if no data, redirect home
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto py-10 px-4 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/", { state: { reviewData } })}
          >
            ← Back to Results
          </Button>
        </div>
        {reviewData && <NLPStepTabs reviewData={reviewData} />}
      </main>
    </div>
  );
};

export default StepsPage;
