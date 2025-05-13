import Lottie from "lottie-react";
import celebrationAnimation from "@/assets/lottie/congrats.json"; // path to your Lottie JSON

export const Congratulations = () => (
  <div className="flex flex-col items-center justify-center mt-10">
    <Lottie
      animationData={celebrationAnimation}
      loop={false}
      style={{ height: 300 }}
    />
    <h2 className="text-2xl font-bold mt-4 text-green-600">
      Congratulations! 🎉
    </h2>
    <p className="text-muted-foreground mt-2 text-sm">
      You've completed the NLP pipeline.
    </p>
  </div>
);
