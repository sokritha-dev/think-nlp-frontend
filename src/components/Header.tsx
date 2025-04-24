import { Separator } from "@/components/ui/separator";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/thinknlp-logo.png"
            alt="ThinkNLP Logo"
            className="h-16 w-auto object-contain"
          />
          <div className="mt-1">
            <h1 className="text-2xl font-bold text-nlp-blue tracking-tight">ThinkNLP</h1>
            <p className="text-muted-foreground text-sm">
              Learn NLP by analyzing real-world review data
            </p>
          </div>
        </div>

      </div>
      <Separator />
    </header>
  );
};

export default Header;
