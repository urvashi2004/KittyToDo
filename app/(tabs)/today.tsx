import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useTasks } from "@/contexts/TasksContext";
import TaskCard from "@/components/TaskCard";
import type {
  TaskCategory,
  TaskPriority,
  TaskRepetition,
} from "@/utils/helpers";
import Navbar from "@/components/Navbar";
import { getTasksForDate, isTaskCompletedOnDate } from "@/utils/helpers";
import dayjs from "dayjs";
import DatePickerWheel from "@/components/DatePickerWheel";
import { Shadows } from "@/constants/theme";
import {
  CATEGORIES,
  PRIORITIES,
  REPETITIONS,
  getCategoryColor,
  priorityColors,
} from "@/constants/taskConstants";

export default function TodayScreen() {
  const {
    tasks,
    completeTaskForDate,
    uncompleteTaskForDate,
    addTask,
    updateTask,
  } = useTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [taskName, setTaskName] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<TaskCategory>("personal");
  const [selectedPriority, setSelectedPriority] =
    useState<TaskPriority>("medium");
  const [selectedRepetition, setSelectedRepetition] =
    useState<TaskRepetition>("none");
  const [deadline, setDeadline] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [endDateDate, setEndDateDate] = useState<Date | null>(null);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const todaysTasks = useMemo(() => {
    return getTasksForDate(tasks, new Date());
  }, [tasks]);

  const handleOpenEditModal = (task: any) => {
    setEditingTask(task.id);
    setTaskName(task.name);
    setSelectedCategory(task.category);
    setSelectedPriority(task.priority);
    setSelectedRepetition(task.repetition);
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const endDate = task.endDate ? new Date(task.endDate) : null;
    setDeadlineDate(deadline);
    setEndDateDate(endDate);
    setDeadline(deadline ? dayjs(deadline).format("YYYY-MM-DD") : "");
    setEndDate(endDate ? dayjs(endDate).format("YYYY-MM-DD") : "");
    setModalVisible(true);
  };

  const handleSaveTask = async () => {
    if (!taskName.trim()) {
      Alert.alert("Error", "Please enter a task name");
      return;
    }

    try {
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask, {
          name: taskName,
          category: selectedCategory,
          priority: selectedPriority,
          repetition: selectedRepetition,
          deadline: deadlineDate || undefined,
          endDate: endDateDate || undefined,
        });
      } else {
        // Add new task
        await addTask({
          name: taskName,
          category: selectedCategory,
          priority: selectedPriority,
          repetition: selectedRepetition,
          deadline: deadlineDate || undefined,
          endDate: endDateDate || undefined,
        });
      }

      setTaskName("");
      setSelectedCategory("personal");
      setSelectedPriority("medium");
      setSelectedRepetition("none");
      setDeadline("");
      setEndDate("");
      setDeadlineDate(null);
      setEndDateDate(null);
      setEditingTask(null);
      setModalVisible(false);
    } catch (error) {
      Alert.alert(
        "Error",
        editingTask ? "Failed to update task" : "Failed to add task",
      );
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const today = new Date();
    const isCompleted = todaysTasks.find((t) => t.id === taskId)
      ? isTaskCompletedOnDate(todaysTasks.find((t) => t.id === taskId)!, today)
      : false;

    if (isCompleted) {
      await uncompleteTaskForDate(taskId, today);
    } else {
      await completeTaskForDate(taskId, today);
    }
  };

  const completedCount = todaysTasks.filter((task) =>
    isTaskCompletedOnDate(task, new Date()),
  ).length;

  const completionPercentage =
    todaysTasks.length > 0
      ? Math.round((completedCount / todaysTasks.length) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.title}>Today's Tasks</Text>
            <Text style={styles.date}>{dayjs().format("dddd, MMMM D")}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
            <View style={styles.statsBox}>
              <Text style={styles.statsText}>
                {completedCount}/{todaysTasks.length}
              </Text>
              <Text style={styles.statsLabel}>Done</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        {todaysTasks.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completionPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completionPercentage}% Complete
            </Text>
          </View>
        )}

        <FlatList
          data={todaysTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isCompleted = isTaskCompletedOnDate(item, new Date());
            return (
              <TaskCard
                task={item}
                isCompleted={isCompleted}
                onCheckboxPress={() => handleToggleTask(item.id)}
                onEditPress={() => handleOpenEditModal(item)}
                showEditIcon={true}
                showDeleteIcon={false}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tasks for today!</Text>
              <Text style={styles.emptyStateSubtext}>Enjoy your free time</Text>
            </View>
          }
        />
      </View>
      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setEditingTask(null);
              }}
            >
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingTask ? "Edit Task" : "New Task"}
            </Text>
            <TouchableOpacity onPress={handleSaveTask}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Task Name */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Task Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter task name"
                value={taskName}
                onChangeText={setTaskName}
                placeholderTextColor="#ccc"
              />
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      selectedCategory === cat.value &&
                        styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.value)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === cat.value &&
                          styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Priority</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRIORITIES.map((pri) => (
                  <TouchableOpacity
                    key={pri.value}
                    style={[
                      styles.priorityButton,
                      selectedPriority === pri.value &&
                        styles.priorityButtonActive,
                    ]}
                    onPress={() => setSelectedPriority(pri.value)}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        selectedPriority === pri.value &&
                          styles.priorityButtonTextActive,
                      ]}
                    >
                      {pri.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Repetition */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Repetition</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {REPETITIONS.map((rep) => (
                  <TouchableOpacity
                    key={rep.value}
                    style={[
                      styles.repetitionButton,
                      selectedRepetition === rep.value &&
                        styles.repetitionButtonActive,
                    ]}
                    onPress={() => setSelectedRepetition(rep.value)}
                  >
                    <Text
                      style={[
                        styles.repetitionButtonText,
                        selectedRepetition === rep.value &&
                          styles.repetitionButtonTextActive,
                      ]}
                    >
                      {rep.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Deadline */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Deadline (Optional)</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDeadlinePicker(true)}
              >
                <Text style={styles.datePickerButtonText}>
                  {deadline ? deadline : "Select Date"}
                </Text>
              </TouchableOpacity>
              {deadline && (
                <TouchableOpacity
                  onPress={() => {
                    setDeadline("");
                    setDeadlineDate(null);
                  }}
                  style={styles.clearDateButton}
                >
                  <Text style={styles.clearDateText}>Clear Date</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* End Date - Only for recurring tasks */}
            {selectedRepetition !== "none" && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  End Date (Optional) - When to stop repeating
                </Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.datePickerButtonText}>
                    {endDate ? endDate : "Select Date"}
                  </Text>
                </TouchableOpacity>
                {endDate && (
                  <TouchableOpacity
                    onPress={() => {
                      setEndDate("");
                      setEndDateDate(null);
                    }}
                    style={styles.clearDateButton}
                  >
                    <Text style={styles.clearDateText}>Clear Date</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
      {/* Date Picker Wheels */}
      <DatePickerWheel
        visible={showDeadlinePicker}
        selectedDate={deadlineDate}
        onConfirm={(date) => {
          setDeadlineDate(date);
          setDeadline(dayjs(date).format("YYYY-MM-DD"));
          setShowDeadlinePicker(false);
        }}
        onCancel={() => setShowDeadlinePicker(false)}
      />
      <DatePickerWheel
        visible={showEndDatePicker}
        selectedDate={endDateDate}
        onConfirm={(date) => {
          setEndDateDate(date);
          setEndDate(dayjs(date).format("YYYY-MM-DD"));
          setShowEndDatePicker(false);
        }}
        onCancel={() => setShowEndDatePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.small,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  dateBoxContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  dateBox: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    ...Shadows.medium,
  },
  dateBoxDay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  dateBoxDate: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  statsBox: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statsLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  progressText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.small,
  },
  taskCardCompleted: {
    backgroundColor: "#f9f9f9",
    opacity: 0.6,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#007AFF",
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  taskNameCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
    textTransform: "capitalize",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  repetitionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  repetitionText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
    textTransform: "capitalize",
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyStateEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#ccc",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalCloseButton: {
    fontSize: 16,
    color: "#999",
  },
  modalSaveButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  modalContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#000",
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  categoryButtonActive: {
    backgroundColor: "#9C27B0",
    borderColor: "#9C27B0",
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  priorityButtonActive: {
    backgroundColor: "#FFC107",
    borderColor: "#FFC107",
  },
  priorityButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  priorityButtonTextActive: {
    color: "#000",
  },
  repetitionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  repetitionButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  repetitionButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  repetitionButtonTextActive: {
    color: "#fff",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  datePickerButtonText: {
    fontSize: 14,
    color: "#000",
  },
  clearDateButton: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  clearDateText: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "500",
  },
});
