import { diffWords } from "diff";

export const highlightDiff = (before: string, after: string) => {
  const diff = diffWords(before, after);
  return diff.map((part, idx) => {
    if (part.added) {
      return (
        <mark key={idx} className="bg-green-200">
          {part.value}
        </mark>
      );
    }
    if (part.removed) {
      return (
        <del key={idx} className="text-red-500">
          {part.value}
        </del>
      );
    }
    return <span key={idx}>{part.value}</span>;
  });
};
