
import { FileText, Book, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-nlp-navy" />
            <div>
              <h1 className="text-2xl font-bold text-nlp-blue tracking-tight">Review Whisperer</h1>
              <p className="text-muted-foreground text-sm">NLP Learning Lab</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button variant="outline" size="sm" className="gap-2">
              <Book className="h-4 w-4" />
              <span>Documentation</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              <span>Sample Data</span>
            </Button>
          </div>
        </div>
      </div>
      <Separator />
    </header>
  );
};

export default Header;
