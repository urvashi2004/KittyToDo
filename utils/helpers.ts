import dayjs from "dayjs";

export type TaskCategory =
  | "work"
  | "personal"
  | "health"
  | "shopping"
  | "college"
  | "tech"
  | "other";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskRepetition = "none" | "daily" | "weekly" | "monthly";

export interface Task {
  id: string;
  userId: string;
  name: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline?: Date;
  repetition: TaskRepetition;
  endDate?: Date; // When the recurring task should stop repeating
  completedDates: string[]; // Array of dates in YYYY-MM-DD format
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

/**
 * Format a date to a readable string
 */
export const formatDate = (
  date: Date | string,
  format = "MMM D, YYYY",
): string => {
  return dayjs(date).format(format);
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  return dayjs(date).isSame(dayjs(), "day");
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  return dayjs(date).isBefore(dayjs(), "day");
};

/**
 * Get the number of days between two dates
 */
export const getDaysBetween = (
  date1: Date | string,
  date2: Date | string,
): number => {
  return dayjs(date1).diff(dayjs(date2), "day");
};

/**
 * Sort tasks by priority
 */
export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return [...tasks].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );
};

/**
 * Get tasks for a specific date (including repeating tasks only, excluding one-time tasks)
 */
export const getTasksForDate = (tasks: Task[], date: Date | string): Task[] => {
  const targetDate = dayjs(date);
  const targetDateStr = targetDate.format("YYYY-MM-DD");

  return tasks.filter((task) => {
    // Exclude one-time tasks (they should only appear in the To-Do tab)
    if (task.repetition === "none") {
      return false;
    }

    const createdDate = dayjs(task.createdAt);
    if (targetDate.isBefore(createdDate, "day")) {
      return false;
    }

    // Check if task has ended (for recurring tasks)
    if (task.endDate) {
      const endDate = dayjs(task.endDate);
      if (targetDate.isAfter(endDate, "day")) {
        return false;
      }
    }

    // Check if explicitly completed on this date
    if (task.completedDates.includes(targetDateStr)) {
      return true;
    }

    if (task.repetition === "daily") {
      return true;
    } else if (task.repetition === "weekly") {
      return targetDate.day() === createdDate.day();
    } else if (task.repetition === "monthly") {
      return targetDate.date() === createdDate.date();
    }

    return false;
  });
};

/**
 * Check if a task is completed on a specific date
 */
export const isTaskCompletedOnDate = (
  task: Task,
  date: Date | string,
): boolean => {
  const dateStr = dayjs(date).format("YYYY-MM-DD");
  return task.completedDates.includes(dateStr);
};

/**
 * Get task completion percentage for a date
 */
export const getDateCompletionPercentage = (
  tasks: Task[],
  date: Date | string,
): number => {
  const tasksForDate = getTasksForDate(tasks, date);
  if (tasksForDate.length === 0) return 0;

  const completedCount = tasksForDate.filter((task) =>
    isTaskCompletedOnDate(task, date),
  ).length;
  return Math.round((completedCount / tasksForDate.length) * 100);
};

/**
 * Get consecutive day streak for completing all tasks
 * Returns the count of consecutive days (going backwards) where all tasks were completed
 */
export const getCompletionStreak = (
  tasks: Task[],
  date: Date | string,
): number => {
  let streak = 0;
  let currentDate = dayjs(date);

  // Check current day and all previous days
  while (true) {
    const tasksForDate = getTasksForDate(tasks, currentDate.toDate());

    // If no tasks exist for this date, stop counting
    if (tasksForDate.length === 0) {
      break;
    }

    // Check if all tasks are completed
    const allCompleted = tasksForDate.every((task) =>
      isTaskCompletedOnDate(task, currentDate.toDate()),
    );

    if (allCompleted) {
      streak++;
      currentDate = currentDate.subtract(1, "day");
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Get the current streak (consecutive days ending today where all tasks were completed)
 */
export const getCurrentStreak = (tasks: Task[]): number => {
  return getCompletionStreak(tasks, dayjs().toDate());
};

/**
 * Get the longest streak across all time
 */
export const getLongestStreak = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;

  // Find the earliest task creation date
  let earliestDate = dayjs();
  tasks.forEach((task) => {
    const createdDate = dayjs(task.createdAt);
    if (createdDate.isBefore(earliestDate)) {
      earliestDate = createdDate;
    }
  });

  let maxStreak = 0;
  let currentDate = earliestDate;
  const today = dayjs();

  // Iterate through all days from earliest task to today
  while (
    currentDate.isBefore(today, "day") ||
    currentDate.isSame(today, "day")
  ) {
    const tasksForDate = getTasksForDate(tasks, currentDate.toDate());

    if (tasksForDate.length > 0) {
      // Check if all tasks are completed for this date
      const allCompleted = tasksForDate.every((task) =>
        isTaskCompletedOnDate(task, currentDate.toDate()),
      );

      if (allCompleted) {
        // Start counting streak
        let streak = 0;
        let streakDate = currentDate;

        while (true) {
          const streakTasks = getTasksForDate(tasks, streakDate.toDate());
          if (streakTasks.length === 0) break;

          const streakAllCompleted = streakTasks.every((task) =>
            isTaskCompletedOnDate(task, streakDate.toDate()),
          );

          if (streakAllCompleted) {
            streak++;
            streakDate = streakDate.add(1, "day");
          } else {
            break;
          }
        }

        maxStreak = Math.max(maxStreak, streak);
        currentDate = streakDate.subtract(1, "day");
      }
    }

    currentDate = currentDate.add(1, "day");
  }

  return maxStreak;
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Validate task data
 */
export const validateTask = (
  task: Partial<Task>,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!task.name || task.name.trim().length === 0) {
    errors.push("Task name is required");
  }

  if (task.name && task.name.length > 100) {
    errors.push("Task name must be less than 100 characters");
  }

  if (task.deadline && !dayjs(task.deadline).isValid()) {
    errors.push("Invalid deadline");
  }

  if (
    task.deadline &&
    dayjs(task.deadline).isBefore(dayjs(), "day") &&
    task.repetition === "none"
  ) {
    errors.push("Deadline cannot be in the past for one-time tasks");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get tasks due today
 */
export const getTasksDueToday = (tasks: Task[]): Task[] => {
  return getTasksForDate(tasks, new Date());
};

/**
 * Get overdue one-time tasks
 */
export const getOverdueTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(
    (task) =>
      task.repetition === "none" &&
      task.deadline &&
      dayjs(task.deadline).isBefore(dayjs(), "day") &&
      !isTaskCompletedOnDate(task, task.deadline),
  );
};

/**
 * Calculate completion percentage of a task's checklist
 */
export const getChecklistProgress = (checklist?: ChecklistItem[]): number => {
  if (!checklist || checklist.length === 0) return 0;

  const completedItems = checklist.filter((item) => item.completed).length;
  return Math.round((completedItems / checklist.length) * 100);
};
