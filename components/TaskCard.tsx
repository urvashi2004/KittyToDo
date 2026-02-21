import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import type { Task } from "@/utils/helpers";
import { getCategoryColor, priorityColors } from "@/constants/taskConstants";
import { Shadows } from "@/constants/theme";

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onCheckboxPress: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  showDeleteIcon?: boolean;
  showEditIcon?: boolean;
  today?: string;
}

export default function TaskCard({
  task,
  isCompleted,
  onCheckboxPress,
  onEditPress,
  onDeletePress,
  showDeleteIcon = false,
  showEditIcon = true,
  today,
}: TaskCardProps) {
  return (
    <View style={styles.taskCard}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={onCheckboxPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View
          style={[styles.checkboxBox, isCompleted && styles.checkboxBoxChecked]}
        >
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text
            style={[styles.taskName, isCompleted && styles.taskNameCompleted]}
          >
            {task.name}
          </Text>
        </View>
        <View style={styles.taskMeta}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(task.category) },
            ]}
          >
            <Text style={styles.categoryText}>{task.category}</Text>
          </View>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityColors[task.priority] },
            ]}
          >
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>
          <Text style={styles.repetitionText}>
            {task.repetition !== "none"
              ? `${task.repetition.toUpperCase().charAt(0)}${task.repetition.slice(1)}`
              : "Once"}
          </Text>
          {task.deadline && (
            <Text style={styles.deadlineText}>
              Due: {dayjs(task.deadline).format("MMM D")}
            </Text>
          )}
        </View>
      </View>
      {showEditIcon && onEditPress && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.6}
        >
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
      )}
      {showDeleteIcon && onDeletePress && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDeletePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  taskNameCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
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
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
});
