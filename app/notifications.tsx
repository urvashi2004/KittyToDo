import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "@/components/Navbar";
import { Shadows } from "@/constants/theme";
import DatePickerWheel from "@/components/DatePickerWheel";
import dayjs from "dayjs";

interface NotificationReminder {
  id: string;
  taskName?: string;
  time: string; // HH:MM format
  enabled: boolean;
  days: string[]; // ['Mon', 'Tue', 'Wed', etc.]
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState<NotificationReminder[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Load reminders from localStorage
  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      // In a real app, you'd load from AsyncStorage or Firebase
      // For now, we'll use a default reminder
      const defaultReminders: NotificationReminder[] = [
        {
          id: "1",
          taskName: "Daily Task Reminder",
          time: "09:00",
          enabled: true,
          days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
      ];
      setReminders(defaultReminders);
    } catch (error) {
      console.error("Failed to load reminders:", error);
    }
  };

  const handleAddReminder = () => {
    setEditingId(null);
    setSelectedTime(null);
    setShowAddModal(true);
  };

  const handleSaveReminder = () => {
    if (!selectedTime) {
      Alert.alert("Error", "Please select a time");
      return;
    }

    const time = dayjs(selectedTime).format("HH:mm");

    if (editingId) {
      // Update existing reminder
      setReminders(
        reminders.map((r) =>
          r.id === editingId
            ? {
                ...r,
                time,
              }
            : r,
        ),
      );
    } else {
      // Add new reminder
      const newReminder: NotificationReminder = {
        id: Date.now().toString(),
        taskName: `Reminder ${reminders.length + 1}`,
        time,
        enabled: true,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      };
      setReminders([...reminders, newReminder]);
    }

    setTimeout(() => {
      setShowAddModal(false);
      setShowTimePicker(false);
    }, 300);
  };

  const handleDeleteReminder = (id: string) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setReminders(reminders.filter((r) => r.id !== id));
          },
        },
      ],
    );
  };

  const handleToggleReminder = (id: string) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  const handleToggleDay = (reminderId: string, day: string) => {
    setReminders(
      reminders.map((r) => {
        if (r.id === reminderId) {
          const newDays = r.days.includes(day)
            ? r.days.filter((d) => d !== day)
            : [...r.days, day];
          return { ...r, days: newDays };
        }
        return r;
      }),
    );
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <View style={styles.container}>
      <Navbar showSettingsButton={false} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Master Toggle */}
        <View style={styles.masterToggleSection}>
          <View>
            <Text style={styles.masterToggleLabel}>Enable Notifications</Text>
            <Text style={styles.masterToggleSubtext}>
              Receive reminders for your tasks
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#ccc", true: "#81C784" }}
            thumbColor={notificationsEnabled ? "#4CAF50" : "#f4f3f4"}
          />
        </View>

        {/* Reminders List */}
        <View style={styles.remindersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Reminders</Text>
            {notificationsEnabled && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddReminder}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {reminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No reminders yet</Text>
              <Text style={styles.emptyStateSubtext}>
                {notificationsEnabled
                  ? "Add a reminder to get started"
                  : "Enable notifications to add reminders"}
              </Text>
            </View>
          ) : (
            reminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderTime}>{reminder.time}</Text>
                    <Text style={styles.reminderLabel}>
                      {reminder.taskName}
                    </Text>
                  </View>
                  <View style={styles.reminderActions}>
                    <Switch
                      value={reminder.enabled}
                      onValueChange={() => handleToggleReminder(reminder.id)}
                      trackColor={{ false: "#ccc", true: "#81C784" }}
                      thumbColor={reminder.enabled ? "#4CAF50" : "#f4f3f4"}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(reminder.id);
                        setSelectedTime(
                          dayjs(
                            `2026-02-21 ${reminder.time}`,
                            "YYYY-MM-DD HH:mm",
                          ).toDate(),
                        );
                        setShowAddModal(true);
                      }}
                      style={styles.editButton}
                    >
                      <Ionicons name="pencil" size={18} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteReminder(reminder.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Days Selection */}
                <View style={styles.daysContainer}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        reminder.days.includes(day) && styles.dayButtonActive,
                      ]}
                      onPress={() => handleToggleDay(reminder.id, day)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          reminder.days.includes(day) &&
                            styles.dayButtonTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Notification Preview */}
                <View style={styles.previewContainer}>
                  <Text style={styles.previewLabel}>Next reminder:</Text>
                  <Text style={styles.previewText}>
                    {getNextReminderDate(reminder)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoPill}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Smart Reminders</Text>
              <Text style={styles.infoDescription}>
                You'll receive notifications at your selected times on selected
                days
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setShowTimePicker(false);
        }}
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader2}>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setShowTimePicker(false);
              }}
            >
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Reminder" : "New Reminder"}
            </Text>
            <TouchableOpacity onPress={handleSaveReminder}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.timePickerSection}>
              <Text style={styles.sectionLabel}>Select Time</Text>
              <TouchableOpacity
                style={styles.timeDisplay}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={24} color="#007AFF" />
                <Text style={styles.timeDisplayText}>
                  {selectedTime
                    ? dayjs(selectedTime).format("hh:mm A")
                    : "Tap to select time"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Time Picker Wheel */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.pickerClose}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Time Picker */}
            <View style={styles.customTimePickerContainer}>
              <TimePickerWheel
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getNextReminderDate(reminder: NotificationReminder): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let nextDate = dayjs();
  let found = false;

  for (let i = 0; i < 7; i++) {
    const checkDate = nextDate.add(i, "day");
    const dayName = days[checkDate.day()];
    const dayAbbr = dayNames[checkDate.day()];

    if (reminder.days.includes(dayAbbr)) {
      return `${dayName} at ${reminder.time}`;
    }
  }

  return "Never";
}

interface TimePickerWheelProps {
  selectedTime: Date | null;
  onTimeChange: (time: Date) => void;
}

function TimePickerWheel({ selectedTime, onTimeChange }: TimePickerWheelProps) {
  const currentTime = selectedTime
    ? dayjs(selectedTime)
    : dayjs().hour(9).minute(0);

  const [hours, setHours] = useState(currentTime.hour());
  const [minutes, setMinutes] = useState(currentTime.minute());

  useEffect(() => {
    const newDate = dayjs().hour(hours).minute(minutes).toDate();
    onTimeChange(newDate);
  }, [hours, minutes]);

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  return (
    <View style={styles.timePickerContent}>
      <View style={styles.timeColumn}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          snapToInterval={40}
          scrollEventThrottle={16}
        >
          {hourOptions.map((hour) => (
            <TouchableOpacity
              key={hour}
              onPress={() => setHours(parseInt(hour))}
              style={[
                styles.timeOption,
                parseInt(hour) === hours && styles.timeOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.timeOptionText,
                  parseInt(hour) === hours && styles.timeOptionTextActive,
                ]}
              >
                {hour}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.timeSeparator}>:</Text>

      <View style={styles.timeColumn}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          snapToInterval={40}
          scrollEventThrottle={16}
        >
          {minuteOptions.map((minute) => (
            <TouchableOpacity
              key={minute}
              onPress={() => setMinutes(parseInt(minute))}
              style={[
                styles.timeOption,
                parseInt(minute) === minutes && styles.timeOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.timeOptionText,
                  parseInt(minute) === minutes && styles.timeOptionTextActive,
                ]}
              >
                {minute}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  masterToggleSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    ...Shadows.small,
  },
  masterToggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  masterToggleSubtext: {
    fontSize: 13,
    color: "#666",
  },
  remindersSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.small,
  },
  reminderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Shadows.small,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  reminderLabel: {
    fontSize: 14,
    color: "#666",
  },
  reminderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#ffe0e0",
  },
  daysContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  dayButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  dayButtonTextActive: {
    color: "#fff",
  },
  previewContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  previewLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: "#ccc",
    textAlign: "center",
  },
  infoSection: {
    marginBottom: 20,
    marginTop: 20,
  },
  infoPill: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: "#0056B3",
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader2: {
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
  timePickerSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  timeDisplay: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  timeDisplayText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  pickerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  pickerClose: {
    fontSize: 16,
    color: "#999",
  },
  pickerDone: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  customTimePickerContainer: {
    padding: 20,
    maxHeight: 400,
  },
  timePickerContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  timeColumn: {
    width: 60,
    height: 200,
  },
  timeOption: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  timeOptionActive: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  timeOptionText: {
    fontSize: 18,
    color: "#ccc",
    fontWeight: "500",
  },
  timeOptionTextActive: {
    color: "#007AFF",
    fontWeight: "700",
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginHorizontal: 8,
  },
});
