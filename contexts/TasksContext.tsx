import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  Timestamp,
  onSnapshot,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import { useAuth } from "./AuthContext";
import type {
  Task,
  TaskCategory,
  TaskPriority,
  TaskRepetition,
} from "@/utils/helpers";
import { generateId } from "@/utils/helpers";

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (taskData: {
    name: string;
    category: TaskCategory;
    priority: TaskPriority;
    deadline?: Date;
    repetition: TaskRepetition;
    endDate?: Date;
  }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTaskForDate: (taskId: string, date: Date | string) => Promise<void>;
  uncompleteTaskForDate: (taskId: string, date: Date | string) => Promise<void>;
  error: string | null;
}

const TasksContext = createContext<TasksContextType>({
  tasks: [],
  loading: true,
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  completeTaskForDate: async () => {},
  uncompleteTaskForDate: async () => {},
  error: null,
});

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};

interface TasksProviderProps {
  children: React.ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from localStorage (for now - replace with Firebase later)
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setTasks([]);
        return;
      }

      // Fetch tasks from Firestore
      const tasksRef = collection(db, "users", user.uid, "tasks");
      const snapshot = await getDocs(tasksRef);
      const loadedTasks = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            deadline: data.deadline?.toDate(),
            endDate: data.endDate?.toDate(),
            deletedAt: data.deletedAt?.toDate(),
            completedDates: data.completedDates || [],
          } as Task;
        })
        .filter((task) => !task.deletedAt); // Filter out deleted tasks
      setTasks(loadedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
      // Fallback to empty array if Firebase fails
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: {
    name: string;
    category: TaskCategory;
    priority: TaskPriority;
    deadline?: Date;
    repetition: TaskRepetition;
    endDate?: Date;
  }) => {
    try {
      if (!user) throw new Error("User not authenticated");
      setError(null);

      const newTask: Task = {
        id: generateId(),
        userId: user.uid,
        name: taskData.name,
        category: taskData.category,
        priority: taskData.priority,
        deadline: taskData.deadline,
        repetition: taskData.repetition,
        endDate: taskData.endDate,
        completedDates: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firestore with explicit document ID
      const taskRef = doc(db, "users", user.uid, "tasks", newTask.id);
      await setDoc(taskRef, {
        ...newTask,
        createdAt: Timestamp.fromDate(newTask.createdAt),
        updatedAt: Timestamp.fromDate(newTask.updatedAt),
        deadline: newTask.deadline
          ? Timestamp.fromDate(newTask.deadline)
          : null,
        endDate: newTask.endDate ? Timestamp.fromDate(newTask.endDate) : null,
      });

      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add task";
      setError(errorMsg);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      if (!user) throw new Error("User not authenticated");
      setError(null);

      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task,
      );

      // Update in Firestore
      const taskRef = doc(db, "users", user.uid, "tasks", id);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
        deadline: updates.deadline
          ? Timestamp.fromDate(updates.deadline)
          : null,
        endDate: updates.endDate ? Timestamp.fromDate(updates.endDate) : null,
      });

      setTasks(updatedTasks);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update task";
      setError(errorMsg);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      if (!user) throw new Error("User not authenticated");
      setError(null);

      console.log("Starting soft delete for task:", id);
      const now = new Date();
      const updatedTasks = tasks.filter((task) => task.id !== id);

      // Soft delete: Set deletedAt in Firestore
      const taskRef = doc(db, "users", user.uid, "tasks", id);
      console.log("Task ref path:", `users/${user.uid}/tasks/${id}`);

      await updateDoc(taskRef, {
        deletedAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });

      console.log("Task successfully marked as deleted in Firestore");
      setTasks(updatedTasks);
    } catch (err) {
      console.error("Delete task error:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete task";
      setError(errorMsg);
      throw err;
    }
  };

  const completeTaskForDate = async (taskId: string, date: Date | string) => {
    try {
      if (!user) throw new Error("User not authenticated");
      setError(null);

      const dateStr =
        typeof date === "string"
          ? date
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const updatedTasks = tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completedDates: [...new Set([...task.completedDates, dateStr])],
              updatedAt: new Date(),
            }
          : task,
      );

      // Update in Firestore
      const taskRef = doc(db, "users", user.uid, "tasks", taskId);
      const task = updatedTasks.find((t) => t.id === taskId);
      if (task) {
        await updateDoc(taskRef, {
          completedDates: task.completedDates,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }

      setTasks(updatedTasks);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to complete task";
      setError(errorMsg);
      throw err;
    }
  };

  const uncompleteTaskForDate = async (taskId: string, date: Date | string) => {
    try {
      if (!user) throw new Error("User not authenticated");
      setError(null);

      const dateStr =
        typeof date === "string"
          ? date
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const updatedTasks = tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completedDates: task.completedDates.filter((d) => d !== dateStr),
              updatedAt: new Date(),
            }
          : task,
      );

      // Update in Firestore
      const taskRef = doc(db, "users", user.uid, "tasks", taskId);
      const task = updatedTasks.find((t) => t.id === taskId);
      if (task) {
        await updateDoc(taskRef, {
          completedDates: task.completedDates,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }

      setTasks(updatedTasks);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to uncomplete task";
      setError(errorMsg);
      throw err;
    }
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        completeTaskForDate,
        uncompleteTaskForDate,
        error,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};
