import Navbar from "@/components/Navbar";
import { Shadows } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/services/firebaseConfig";
import dayjs, { Dayjs } from "dayjs";
import {
  addDoc,
  collection,
  deleteField,
  doc,
  DocumentData,
  onSnapshot,
  query,
  QuerySnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MoodEntry {
  id?: string; // Firestore doc ID
  date: string; // YYYY-MM-DD
  moods: string[]; // mood IDs
  activities: string[]; // activity IDs
  periodStatus?: "none" | "light" | "medium" | "heavy";
  notes?: string;
}

interface Mood {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

interface Activity {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

const MOODS: Mood[] = [
  { id: "happy", name: "Happy", color: "#4CAF50", emoji: "😊" },
  { id: "sad", name: "Sad", color: "#2196F3", emoji: "😢" },
  { id: "anxious", name: "Anxious", color: "#FF9800", emoji: "😰" },
  { id: "energetic", name: "Energetic", color: "#FFD700", emoji: "⚡" },
  { id: "calm", name: "Calm", color: "#9C27B0", emoji: "😌" },
  { id: "angry", name: "Angry", color: "#F44336", emoji: "😠" },
  { id: "loved", name: "Loved", color: "#E91E63", emoji: "🥰" },
  { id: "tired", name: "Tired", color: "#9E9E9E", emoji: "😴" },
  { id: "disappointed", name: "Disappointed", color: "#607D8B", emoji: "😞" },
];

const ACTIVITIES: Activity[] = [
  { id: "exercise", name: "Exercise", color: "#FF5722", emoji: "🏃" },
  { id: "work", name: "Work", color: "#673AB7", emoji: "💼" },
  { id: "social", name: "Social", color: "#00BCD4", emoji: "👥" },
  { id: "rest", name: "Rest", color: "#8BC34A", emoji: "🛏️" },
  { id: "creative", name: "Creative", color: "#FF6F00", emoji: "🎨" },
  { id: "technology", name: "Technology", color: "#3F51B5", emoji: "💻" },
  { id: "reading", name: "Reading", color: "#795548", emoji: "📚" },
  { id: "meditation", name: "Meditation", color: "#4CAF50", emoji: "🧘" },
];

export default function WellnessScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [periodStatus, setPeriodStatus] = useState<
    "none" | "light" | "medium" | "heavy"
  >("none");
  const [loading, setLoading] = useState(true);

  // Load entries from Firestore on mount and set up listener
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "moodEntries"),
      where("userId", "==", user.uid),
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const entries: MoodEntry[] = [];
        snapshot.forEach((doc) => {
          entries.push({
            id: doc.id,
            date: doc.data().date,
            moods: doc.data().moods,
            activities: doc.data().activities,
            periodStatus: doc.data().periodStatus,
            notes: doc.data().notes,
          });
        });
        setMoodEntries(entries);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  const getEntryForDate = (date: Dayjs): MoodEntry | undefined => {
    return moodEntries.find(
      (entry) => entry.date === date.format("YYYY-MM-DD"),
    );
  };

  const handleDayPress = (date: Dayjs) => {
    setSelectedDay(date);
    const entry = getEntryForDate(date);
    if (entry) {
      setSelectedMoods(entry.moods);
      setSelectedActivities(entry.activities);
      setPeriodStatus(entry.periodStatus || "none");
    } else {
      setSelectedMoods([]);
      setSelectedActivities([]);
      setPeriodStatus("none");
    }
    setModalVisible(true);
  };

  const handleSaveEntry = async () => {
    if (!selectedDay || !user?.uid) return;

    const dateStr = selectedDay.format("YYYY-MM-DD");
    const existingEntry = moodEntries.find((e) => e.date === dateStr);

    // Build entry object, excluding undefined fields
    const newEntry: any = {
      date: dateStr,
      moods: selectedMoods,
      activities: selectedActivities,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    };

    // Only add periodStatus if it's not "none"
    if (periodStatus !== "none") {
      newEntry.periodStatus = periodStatus;
    }

    try {
      if (existingEntry?.id) {
        // Update existing entry
        const updateData: any = { ...newEntry };

        // If changing to "none", explicitly delete the field
        if (periodStatus === "none") {
          updateData.periodStatus = deleteField();
        }

        await updateDoc(doc(db, "moodEntries", existingEntry.id), updateData);
      } else {
        // Add new entry
        await addDoc(collection(db, "moodEntries"), newEntry);
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const blendColors = (colors: string[]): string => {
    if (colors.length === 0) return "#f5f5f5";
    if (colors.length === 1) return colors[0];

    // Convert hex to RGB and average them
    const rgbColors = colors.map((hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 100, g: 100, b: 100 };
    });

    const avgR = Math.round(
      rgbColors.reduce((sum, c) => sum + c.r, 0) / rgbColors.length,
    );
    const avgG = Math.round(
      rgbColors.reduce((sum, c) => sum + c.g, 0) / rgbColors.length,
    );
    const avgB = Math.round(
      rgbColors.reduce((sum, c) => sum + c.b, 0) / rgbColors.length,
    );

    return `rgb(${avgR}, ${avgG}, ${avgB})`;
  };

  const getDayColors = (date: Dayjs): string[] => {
    const entry = getEntryForDate(date);
    if (!entry || entry.moods.length === 0) return ["#f5f5f5"];

    const moodColors = entry.moods
      .map((moodId) => MOODS.find((m) => m.id === moodId)?.color)
      .filter(Boolean) as string[];

    return moodColors.length > 0 ? moodColors : ["#f5f5f5"];
  };

  const getIconSize = (activityCount: number): number => {
    if (activityCount <= 2) return 13;
    if (activityCount <= 4) return 10;
    return 8;
  };

  const renderCalendarGrid = () => {
    const startOfMonth = selectedDate.startOf("month");
    const endOfMonth = selectedDate.endOf("month");
    const startDay = startOfMonth.day();
    const daysInMonth = endOfMonth.date();

    const days = [];

    // Empty cells
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = startOfMonth.date(day);
      const isToday = date.isSame(dayjs(), "day");
      const dayColors = getDayColors(date);
      const entry = getEntryForDate(date);

      let periodBorderColor: string | undefined;
      if (entry?.periodStatus && entry.periodStatus !== "none") {
        if (entry.periodStatus === "light") periodBorderColor = "#FFB6C1";
        if (entry.periodStatus === "medium") periodBorderColor = "#FF69B4";
        if (entry.periodStatus === "heavy") periodBorderColor = "#C71585";
      }

      const hasActivities = entry && entry.activities.length > 0;
      const iconSize = hasActivities ? getIconSize(entry.activities.length) : 9;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayContainer,
            isToday && styles.dayContainerToday,
            periodBorderColor && {
              borderWidth: 2.5,
              borderColor: periodBorderColor,
            },
            hasActivities && styles.dayContainerWithIcons,
          ]}
          onPress={() => handleDayPress(date)}
        >
          {/* Color Layers */}
          <View style={styles.colorLayersContainer}>
            {dayColors.map((color, index) => (
              <View
                key={`color-${index}`}
                style={[
                  styles.colorLayer,
                  {
                    backgroundColor: color,
                    height: `${100 / dayColors.length}%`,
                  },
                ]}
              />
            ))}
          </View>

          {/* Day Number */}
          <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
            {day}
          </Text>

          {/* Activity Icons */}
          {hasActivities ? (
            <View style={styles.iconContainer}>
              {entry &&
                entry.activities.map((activityId) => {
                  const activity = ACTIVITIES.find((a) => a.id === activityId);
                  return (
                    <Text
                      key={`activity-${activityId}`}
                      style={[styles.iconEmoji, { fontSize: iconSize }]}
                    >
                      {activity?.emoji}
                    </Text>
                  );
                })}
            </View>
          ) : null}
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
      <Navbar showSettingsButton={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Heading */}
        <Text style={styles.pageTitle}>Your Mood Tracker</Text>

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

        {/* Mood Legend */}
        {/* <View style={styles.legendSection}>
          <Text style={styles.legendTitle}>Moods</Text>
          <View style={styles.legendGrid}>
            {MOODS.map((mood) => (
              <View key={mood.id} style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: mood.color }]}
                />
                <Text style={styles.legendLabel}>{mood.emoji}</Text>
              </View>
            ))}
          </View>
        </View> */}

        {/* Period Legend */}
        {/* <View style={styles.periodLegendSection}>
          <Text style={styles.legendTitle}>Period Tracking</Text>
          <View style={styles.periodLegendGrid}>
            <View style={styles.periodLegendItem}>
              <View
                style={[styles.periodDot, { backgroundColor: "#FFB6C1" }]}
              />
              <Text style={styles.periodLegendLabel}>Light</Text>
            </View>
            <View style={styles.periodLegendItem}>
              <View
                style={[styles.periodDot, { backgroundColor: "#FF69B4" }]}
              />
              <Text style={styles.periodLegendLabel}>Medium</Text>
            </View>
            <View style={styles.periodLegendItem}>
              <View
                style={[styles.periodDot, { backgroundColor: "#C71585" }]}
              />
              <Text style={styles.periodLegendLabel}>Heavy</Text>
            </View>
          </View>
        </View> */}

        <View style={styles.spacer} />
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
              <TouchableOpacity onPress={handleSaveEntry}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Mood Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How are you feeling?</Text>
                <View style={styles.moodGrid}>
                  {MOODS.map((mood) => (
                    <TouchableOpacity
                      key={mood.id}
                      style={[
                        styles.moodButton,
                        selectedMoods.includes(mood.id) &&
                          styles.moodButtonSelected,
                        { borderColor: mood.color },
                      ]}
                      onPress={() => {
                        setSelectedMoods((prev) =>
                          prev.includes(mood.id)
                            ? prev.filter((m) => m !== mood.id)
                            : [...prev, mood.id],
                        );
                      }}
                    >
                      <Text style={styles.moodEmojiBig}>{mood.emoji}</Text>
                      <Text style={styles.moodName}>{mood.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Activity Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Activities</Text>
                <View style={styles.activityGrid}>
                  {ACTIVITIES.map((activity) => (
                    <TouchableOpacity
                      key={activity.id}
                      style={[
                        styles.activityButton,
                        selectedActivities.includes(activity.id) &&
                          styles.activityButtonSelected,
                        { borderColor: activity.color },
                      ]}
                      onPress={() => {
                        setSelectedActivities((prev) =>
                          prev.includes(activity.id)
                            ? prev.filter((a) => a !== activity.id)
                            : [...prev, activity.id],
                        );
                      }}
                    >
                      <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                      <Text style={styles.activityName}>{activity.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Period Tracking */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Period Status</Text>
                <View style={styles.periodButtonsContainer}>
                  {(["none", "light", "medium", "heavy"] as const).map(
                    (status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.periodButton,
                          periodStatus === status &&
                            styles.periodButtonSelected,
                          status === "light" && { borderColor: "#FFB6C1" },
                          status === "medium" && { borderColor: "#FF69B4" },
                          status === "heavy" && { borderColor: "#C71585" },
                        ]}
                        onPress={() => setPeriodStatus(status)}
                      >
                        <Text style={styles.periodButtonText}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>

              {/* Day Summary */}
              {selectedMoods.length > 0 && (
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>How your day looks</Text>
                  <View
                    style={[
                      styles.dayColorPreview,
                      {
                        backgroundColor: blendColors(
                          selectedMoods
                            .map(
                              (moodId) =>
                                MOODS.find((m) => m.id === moodId)?.color,
                            )
                            .filter(Boolean) as string[],
                        ),
                      },
                    ]}
                  />
                  <View style={styles.moodSummary}>
                    {selectedMoods.map((moodId) => {
                      const mood = MOODS.find((m) => m.id === moodId);
                      return (
                        <View key={moodId} style={styles.moodSummaryItem}>
                          <Text style={styles.moodSummaryEmoji}>
                            {mood?.emoji}
                          </Text>
                          <Text style={styles.moodSummaryName}>
                            {mood?.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>
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
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
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
    borderRadius: 8,
    marginBottom: 8,
    padding: 6,
    overflow: "hidden",
    ...Shadows.small,
  },
  colorLayersContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
  },
  colorLayer: {
    width: "100%",
  },
  dayContainerToday: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  dayContainerWithIcons: {
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    zIndex: 1,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  dayNumberToday: {
    color: "#007AFF",
  },
  emptyDay: {
    width: "14.285%",
    aspectRatio: 1,
  },
  iconContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    justifyContent: "center",
    gap: 0.5,
    width: "100%",
    zIndex: 1,
  },
  iconEmoji: {
    fontSize: 9,
  },
  legendSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Shadows.small,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: "#666",
  },
  periodLegendSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Shadows.small,
  },
  periodLegendGrid: {
    flexDirection: "row",
    gap: 16,
  },
  periodLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  periodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  periodLegendLabel: {
    fontSize: 12,
    color: "#666",
  },
  spacer: {
    height: 20,
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
    maxHeight: "90%",
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
  saveButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  modalBody: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moodButton: {
    width: "22%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  moodButtonSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  moodEmojiBig: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodName: {
    fontSize: 10,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  activityButton: {
    width: "22%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  activityButtonSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  activityEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  activityName: {
    fontSize: 10,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  periodButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  periodButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  periodButtonSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  summarySection: {
    marginTop: 16,
  },
  dayColorPreview: {
    height: 100,
    borderRadius: 12,
    marginBottom: 16,
    ...Shadows.small,
  },
  moodSummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  moodSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  moodSummaryEmoji: {
    fontSize: 16,
  },
  moodSummaryName: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});
