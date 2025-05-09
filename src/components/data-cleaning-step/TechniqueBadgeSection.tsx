import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const TechniqueBadgeSection = ({
  title,
  badges,
}: {
  title: string;
  badges: { label: string; tip: string }[];
}) => (
  <div className="flex flex-col gap-1 mb-2">
    <span className="text-xs text-muted-foreground font-medium">{title}</span>
    <div className="flex flex-wrap gap-1">
      {badges.map((b, idx) => (
        <TooltipProvider key={idx}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Badge variant="outline" className="cursor-help">
                  {b.label}
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent
              className="max-w-xs p-4 bg-white border text-sm leading-relaxed shadow-lg rounded-md"
              side="top"
              align="center"
            >
              <span className="font-semibold text-nlp-blue block mb-1">
                {b.label}
              </span>
              <p className="text-muted-foreground whitespace-pre-line">
                {b.tip}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  </div>
);
