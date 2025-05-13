import { Loader2 } from "lucide-react";

export default function TextLoader({
  topic,
  description,
}: {
  topic: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center mt-6 border border-border bg-muted/40 rounded-lg py-8 px-4 text-center">
      <Loader2 className="animate-spin h-6 w-6 text-purple-600 mb-3" />
      <p className="text-sm text-muted-foreground font-medium">{topic}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
