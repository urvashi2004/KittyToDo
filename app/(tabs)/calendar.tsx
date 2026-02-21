import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs, { Dayjs } from "dayjs";
import { useTasks } from "@/contexts/TasksContext";
import TaskCard from "@/components/TaskCard";
import Navbar from "@/components/Navbar";
import {
  getTasksForDate,
  isTaskCompletedOnDate,
  getDateCompletionPercentage,
  getCompletionStreak,
  getCurrentStreak,
  getLongestStreak,
} from "@/utils/helpers";
import { Shadows } from "@/constants/theme";
import { getCategoryColor } from "@/constants/taskConstants";

export default function CalendarScreen() {
  const { tasks, completeTaskForDate, uncompleteTaskForDate } = useTasks();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const daysTasks = useMemo(() => {
    if (!selectedDay) return [];
    return getTasksForDate(tasks, selectedDay.toDate());
  }, [tasks, selectedDay]);

  const handleToggleTask = async (taskId: string) => {
    if (!selectedDay) return;
    const task = daysTasks.find((t) => t.id === taskId);
    if (!task) return;

    if (isTaskCompletedOnDate(task, selectedDay.toDate())) {
      await uncompleteTaskForDate(taskId, selectedDay.toDate());
    } else {
      await completeTaskForDate(taskId, selectedDay.toDate());
    }
  };

  const renderCalendarGrid = () => {
    const startOfMonth = selectedDate.startOf("month");
    const endOfMonth = selectedDate.endOf("month");
    const startDay = startOfMonth.day();
    const daysInMonth = endOfMonth.date();

    const days = [];

    // Empty cells for days before the month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = startOfMonth.date(day);
      const isToday = date.isSame(dayjs(), "day");
      const dayTasksList = getTasksForDate(tasks, date.toDate());
      const completionPercentage = getDateCompletionPercentage(
        tasks,
        date.toDate(),
      );
      const hasCompletedAllTasks =
        dayTasksList.length > 0 && completionPercentage === 100;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayContainer,
            isToday && styles.dayContainerToday,
            dayTasksList.length === 0 && styles.dayContainerEmpty,
          ]}
          onPress={() => {
            setSelectedDay(date);
            setModalVisible(true);
          }}
        >
          <Text
            style={[
              styles.dayNumber,
              isToday && styles.dayNumberToday,
              dayTasksList.length === 0 && styles.dayNumberEmpty,
            ]}
          >
            {day}
          </Text>

          {dayTasksList.length === 0 ? (
            <Text style={styles.emptyDayPlaceholder}>-</Text>
          ) : hasCompletedAllTasks ? (
            <Ionicons
              name="sparkles"
              size={Math.min(
                24 + (getCompletionStreak(tasks, date.toDate()) - 1) * 4,
                48,
              )}
              color="#FFD700"
            />
          ) : (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${completionPercentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>
                {completionPercentage}%
              </Text>
            </View>
          )}
        </TouchableOpacity>,
      );
    }

    return days;
  };

  const renderWeekDays = () => {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekDays.map((day) => (
      <Text key={day} style={styles.weekDay}>
        {day}
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity
            onPress={() => setSelectedDate(selectedDate.subtract(1, "month"))}
          >
            <Text style={styles.navButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {selectedDate.format("MMMM YYYY")}
          </Text>
          <TouchableOpacity
            onPress={() => setSelectedDate(selectedDate.add(1, "month"))}
          >
            <Text style={styles.navButton}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          <View style={styles.weekDaysContainer}>{renderWeekDays()}</View>
          <View style={styles.daysGrid}>{renderCalendarGrid()}</View>
        </View>

        {/* Streak Statistics */}
        <View style={styles.streakContainer}>
          <View style={styles.streakCard}>
            <Text style={styles.streakLabel}>Your longest streak</Text>
            <Text style={styles.streakNumber}>{getLongestStreak(tasks)}</Text>
            <Text style={styles.streakDays}>days</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.streakLabel}>Your current streak</Text>
            <Text style={styles.streakNumber}>{getCurrentStreak(tasks)}</Text>
            <Text style={styles.streakDays}>days</Text>
          </View>
        </View>

        {/* Legend */}
        {/* <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendColor} />
            <Text style={styles.legendText}>Days with tasks</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#f0f0f0" }]}
            />
            <Text style={styles.legendText}>No tasks</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>😊</Text>
            <Text style={styles.legendText}>All done</Text>
          </View>
        </View> */}
      </ScrollView>

      {/* Day Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {selectedDay?.format("MMMM D, YYYY")}
              </Text>
              <View style={{ width: 30 }} />
            </View>

            <FlatList
              data={daysTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isCompleted = isTaskCompletedOnDate(
                  item,
                  selectedDay!.toDate(),
                );
                return (
                  <TaskCard
                    task={item}
                    isCompleted={isCompleted}
                    onCheckboxPress={() => handleToggleTask(item.id)}
                    showEditIcon={false}
                    showDeleteIcon={false}
                  />
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyTaskContainer}>
                  <Image
                    source={require("@/assets/animals/PlayingDog.png")}
                    style={styles.emptyTaskImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.noTasksText}>
                    No task scheduled for the day
                  </Text>
                </View>
              }
              ListFooterComponent={
                daysTasks.length > 0 &&
                daysTasks.every((task) =>
                  isTaskCompletedOnDate(task, selectedDay!.toDate()),
                ) ? (
                  <View style={styles.completionContainer}>
                    <Image
                      source={require("@/assets/animals/WorkDoneSnoopy.jpg")}
                      style={styles.completionImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.completionText}>
                      All tasks done! Yay :)
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
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
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  navButton: {
    fontSize: 28,
    fontWeight: "300",
    color: "#007AFF",
    paddingHorizontal: 12,
  },
  calendar: {
    marginBottom: 20,
  },
  streakContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  streakCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    ...Shadows.small,
  },
  streakLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 4,
  },
  streakDays: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  weekDaysContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDay: {
    width: "14.285%",
    textAlign: "center",
    fontWeight: "600",
    color: "#666",
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayContainer: {
    width: "14.285%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    padding: 6,
    ...Shadows.small,
  },
  dayContainerToday: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  dayContainerEmpty: {
    backgroundColor: "#f5f5f5",
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  dayNumberToday: {
    color: "#007AFF",
  },
  dayNumberEmpty: {
    color: "#ccc",
  },
  emptyDay: {
    width: "14.285%",
    aspectRatio: 1,
  },
  emptyDayPlaceholder: {
    fontSize: 16,
    color: "#ddd",
  },
  progressContainer: {
    width: "100%",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  progressPercentage: {
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
  smileyIcon: {
    fontSize: 24,
  },
  legend: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginRight: 12,
  },
  legendEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
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
    width: 30,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  taskItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
  },
  taskItemCompleted: {
    backgroundColor: "#f9f9f9",
  },
  taskCheckbox: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#007AFF",
  },
  checkmark: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
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
  repetitionText: {
    fontSize: 10,
    color: "#666",
  },
  noTasksText: {
    textAlign: "center",
    color: "#999",
    paddingVertical: 32,
    fontSize: 14,
  },
  emptyTaskContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTaskImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  completionContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  completionImage: {
    width: 150,
    height: 150,
    marginBottom: 12,
  },
  completionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
});
