import React, { useState } from "react";
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
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTasks } from "@/contexts/TasksContext";
import TaskCard from "@/components/TaskCard";
import type {
  TaskCategory,
  TaskPriority,
  TaskRepetition,
} from "@/utils/helpers";
import Navbar from "@/components/Navbar";
import dayjs from "dayjs";
import { Shadows } from "@/constants/theme";
import {
  CATEGORIES,
  PRIORITIES,
  REPETITIONS,
  getCategoryColor,
  priorityColors,
} from "@/constants/taskConstants";

export default function TodoScreen() {
  const {
    tasks,
    addTask,
    deleteTask,
    updateTask,
    completeTaskForDate,
    uncompleteTaskForDate,
  } = useTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [taskName, setTaskName] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<TaskCategory>("personal");
  const [selectedPriority, setSelectedPriority] =
    useState<TaskPriority>("medium");
  const [selectedRepetition, setSelectedRepetition] =
    useState<TaskRepetition>("none");
  const [deadline, setDeadline] = useState("");

  // Get today's date string for completion tracking
  const today = dayjs().format("YYYY-MM-DD");

  // Filter to show only one-time tasks (no repetition)
  const allOneTimeTasks = tasks.filter((task) => task.repetition === "none");

  // Separate active and completed tasks
  const oneTimeTasks = allOneTimeTasks.filter(
    (task) => !task.completedDates.includes(today),
  );
  const completedTasks = allOneTimeTasks.filter((task) =>
    task.completedDates.includes(today),
  );

  const recurringTasks = tasks.filter((task) => task.repetition !== "none");

  const handleOpenEditModal = (task: any) => {
    setEditingTask(task.id);
    setTaskName(task.name);
    setSelectedCategory(task.category);
    setSelectedPriority(task.priority);
    setSelectedRepetition(task.repetition);
    setDeadline(task.deadline ? dayjs(task.deadline).format("YYYY-MM-DD") : "");
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingTask(null);
    setTaskName("");
    setSelectedCategory("personal");
    setSelectedPriority("medium");
    setSelectedRepetition("none");
    setDeadline("");
  };

  const handleSaveTask = async () => {
    if (!taskName.trim()) {
      if (Platform.OS === "web") {
        alert("Please enter a task name");
      } else {
        Alert.alert("Error", "Please enter a task name");
      }
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
          deadline: deadline ? new Date(deadline) : undefined,
        });
      } else {
        // Create new task
        await addTask({
          name: taskName,
          category: selectedCategory,
          priority: selectedPriority,
          repetition: selectedRepetition,
          deadline: deadline ? new Date(deadline) : undefined,
        });
      }

      handleCloseModal();
    } catch (error) {
      if (Platform.OS === "web") {
        alert("Failed to save task");
      } else {
        Alert.alert("Error", "Failed to save task");
      }
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;

    // For web, use window.confirm; for native, use Alert.alert
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this task?",
      );

      if (confirmed) {
        try {
          await deleteTask(editingTask);
          handleCloseModal();
        } catch (error) {
          console.error("Failed to delete task:", error);
          alert("Failed to delete task");
        }
      }
    } else {
      // Native Alert
      Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTask(editingTask);
              handleCloseModal();
            } catch (error) {
              console.error("Failed to delete task:", error);
              Alert.alert("Error", "Failed to delete task");
            }
          },
        },
      ]);
    }
  };

  const handleToggleComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await uncompleteTaskForDate(taskId, today);
      } else {
        await completeTaskForDate(taskId, today);
      }
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>One-Time Tasks</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={oneTimeTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isCompleted = item.completedDates.includes(today);
            return (
              <TaskCard
                task={item}
                isCompleted={isCompleted}
                onCheckboxPress={() =>
                  handleToggleComplete(item.id, isCompleted)
                }
                onEditPress={() => handleOpenEditModal(item)}
                showEditIcon={true}
                showDeleteIcon={false}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Image
                source={require("@/assets/animals/PlayingDog.png")}
                style={styles.emptyStateImage}
              />
              <Text style={styles.emptyStateText}>No active tasks</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the + button to create one
              </Text>
            </View>
          }
        />

        {/* Completed Tasks Button */}
        {completedTasks.length > 0 && (
          <TouchableOpacity
            style={styles.completedButton}
            onPress={() => setShowCompleted(!showCompleted)}
          >
            <Text style={styles.completedButtonText}>
              {showCompleted ? "Hide" : "Show"} Previous Completed Tasks (
              {completedTasks.length})
            </Text>
            <Text style={styles.completedButtonIcon}>
              {showCompleted ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Completed Tasks List */}
        {showCompleted && completedTasks.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.completedSectionTitle}>Completed Tasks</Text>
            {completedTasks.map((item) => {
              const isCompleted = item.completedDates.includes(today);
              return (
                <TaskCard
                  key={item.id}
                  task={item}
                  isCompleted={isCompleted}
                  onCheckboxPress={() =>
                    handleToggleComplete(item.id, isCompleted)
                  }
                  onEditPress={() => handleOpenEditModal(item)}
                  showEditIcon={true}
                  showDeleteIcon={false}
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingTask ? "Edit Task" : "New Task"}
            </Text>
            <View style={styles.modalActions}>
              {editingTask && (
                <TouchableOpacity
                  onPress={handleDeleteTask}
                  style={styles.deleteIconButton}
                >
                  <Ionicons name="trash" size={24} color="#FF3B30" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleSaveTask}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Task Name */}
            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task name"
              value={taskName}
              onChangeText={setTaskName}
              placeholderTextColor="#999"
            />

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.optionGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.optionButton,
                    selectedCategory === cat.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedCategory === cat.value && styles.optionTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority Slider */}
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {PRIORITIES.map((pri) => (
                <TouchableOpacity
                  key={pri.value}
                  style={[
                    styles.priorityOption,
                    selectedPriority === pri.value &&
                      styles.priorityOptionActive,
                  ]}
                  onPress={() => setSelectedPriority(pri.value)}
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      selectedPriority === pri.value &&
                        styles.priorityOptionTextActive,
                    ]}
                  >
                    {pri.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Deadline */}
            <Text style={styles.label}>Deadline (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={deadline}
              onChangeText={setDeadline}
              placeholderTextColor="#999"
            />

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </Modal>
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
  imageSection: {
    marginBottom: 16,
    alignItems: "center",
  },
  tabImage: {
    width: 100,
    height: 100,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "300",
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.small,
  },
  checkbox: {
    marginRight: 12,
    justifyContent: "center",
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: "#007AFF",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  taskContent: {
    flex: 1,
  },
  taskNameCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
    textTransform: "capitalize",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    textTransform: "capitalize",
  },
  repetitionText: {
    fontSize: 12,
    color: "#666",
  },
  deadlineText: {
    fontSize: 12,
    color: "#999",
  },
  editButton: {
    padding: 8,
  },
  editText: {
    fontSize: 18,
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyStateImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
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
  completedButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    ...Shadows.small,
  },
  completedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  completedButtonIcon: {
    fontSize: 16,
    color: "#007AFF",
  },
  completedSection: {
    marginBottom: 20,
  },
  completedSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    fontSize: 24,
    color: "#007AFF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  deleteIconButton: {
    padding: 4,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  optionButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  optionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  optionTextActive: {
    color: "#fff",
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    marginHorizontal: 4,
  },
  priorityOptionActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  priorityOptionTextActive: {
    color: "#fff",
  },
});
