import { Separator } from "@/components/ui/separator";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto py-3 px-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <img
            src="/thinknlp-logo.png"
            alt="ThinkNLP Logo"
            className="h-12 w-auto object-contain"
          />
          <div className="mt-0.5">
            <h1 className="text-xl font-bold text-nlp-blue tracking-tight">
              ThinkNLP
            </h1>
            <p className="text-muted-foreground text-xs">
              Learn NLP by analyzing real-world review data
            </p>
          </div>
        </a>
      </div>
      <Separator />
    </header>
  );
};

export default Header;
