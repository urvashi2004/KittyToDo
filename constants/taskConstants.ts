import type {
  TaskCategory,
  TaskPriority,
  TaskRepetition,
} from "@/utils/helpers";

export const CATEGORIES: { label: string; value: TaskCategory }[] = [
  { label: "Work", value: "work" },
  { label: "Personal", value: "personal" },
  { label: "Health", value: "health" },
  { label: "College", value: "college" },
  { label: "Tech", value: "tech" },
  { label: "Shopping", value: "shopping" },
  { label: "Other", value: "other" },
];

export const PRIORITIES: { label: string; value: TaskPriority }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export const REPETITIONS: { label: string; value: TaskRepetition }[] = [
  { label: "Once", value: "none" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

export const priorityColors: Record<string, string> = {
  low: "#4CAF50",
  medium: "#ffe69d",
  high: "#FF9800",
  urgent: "#F44336",
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    work: "#2196F3",
    personal: "#9C27B0",
    health: "#4CAF50",
    college: "#3F51B5",
    tech: "#009688",
    shopping: "#FF5722",
    other: "#607D8B",
  };
  return colors[category] || "#999";
};
