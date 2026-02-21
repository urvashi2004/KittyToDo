import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import dayjs from "dayjs";

interface DatePickerWheelProps {
  visible: boolean;
  selectedDate: Date | null;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

const DatePickerWheel: React.FC<DatePickerWheelProps> = ({
  visible,
  selectedDate,
  onConfirm,
  onCancel,
}) => {
  const currentDate = selectedDate || new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const yearScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);

  const years = Array.from(
    { length: 50 },
    (_, i) => currentDate.getFullYear() - 25 + i,
  );
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Dynamically generate days based on selected month/year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  const ITEM_HEIGHT = 40;
  const VISIBLE_ITEMS = 5;

  useEffect(() => {
    // Auto-scroll to selected values when picker opens
    if (visible) {
      setTimeout(() => {
        const yearIndex = years.indexOf(selectedYear);
        const monthIndex = months.indexOf(selectedMonth);
        const dayIndex = days.indexOf(selectedDay);

        if (yearScrollRef.current && yearIndex >= 0) {
          yearScrollRef.current.scrollTo({
            y: yearIndex * ITEM_HEIGHT,
            animated: false,
          });
        }
        if (monthScrollRef.current && monthIndex >= 0) {
          monthScrollRef.current.scrollTo({
            y: monthIndex * ITEM_HEIGHT,
            animated: false,
          });
        }
        if (dayScrollRef.current && dayIndex >= 0) {
          dayScrollRef.current.scrollTo({
            y: dayIndex * ITEM_HEIGHT,
            animated: false,
          });
        }
      }, 100);
    }
  }, [visible]);

  const handleConfirm = () => {
    try {
      const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
      if (!isNaN(newDate.getTime())) {
        onConfirm(newDate);
      }
    } catch (e) {
      console.error("Error creating date:", e);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.overlay} onTouchEnd={onCancel} />

        <View style={styles.pickerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.headerButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.selectedDateText}>
              {dayjs(
                new Date(selectedYear, selectedMonth - 1, selectedDay),
              ).format("MMM DD, YYYY")}
            </Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={[styles.headerButton, { color: "#007AFF" }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.wheelContainer}>
            {/* Year Picker */}
            <View style={styles.wheel}>
              <Text style={styles.wheelLabel}>Year</Text>
              <ScrollView
                ref={yearScrollRef}
                scrollEventThrottle={16}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
              >
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    style={[
                      styles.item,
                      selectedYear === year && styles.itemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedYear === year && styles.itemTextSelected,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Month Picker */}
            <View style={styles.wheel}>
              <Text style={styles.wheelLabel}>Month</Text>
              <ScrollView
                ref={monthScrollRef}
                scrollEventThrottle={16}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
              >
                {months.map((month) => (
                  <TouchableOpacity
                    key={month}
                    onPress={() => setSelectedMonth(month)}
                    style={[
                      styles.item,
                      selectedMonth === month && styles.itemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedMonth === month && styles.itemTextSelected,
                      ]}
                    >
                      {monthNames[month - 1]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Day Picker */}
            <View style={styles.wheel}>
              <Text style={styles.wheelLabel}>Day</Text>
              <ScrollView
                ref={dayScrollRef}
                scrollEventThrottle={16}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
              >
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDay(day)}
                    style={[
                      styles.item,
                      selectedDay === day && styles.itemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedDay === day && styles.itemTextSelected,
                      ]}
                    >
                      {String(day).padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  overlay: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerButton: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  wheelContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 300,
    paddingHorizontal: 8,
  },
  wheel: {
    flex: 1,
    alignItems: "center",
  },
  wheelLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
  },
  scrollView: {
    height: 240,
  },
  item: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  itemSelected: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  itemText: {
    fontSize: 18,
    color: "#999",
  },
  itemTextSelected: {
    fontSize: 20,
    fontWeight: "600",
    color: "#007AFF",
  },
});

export default DatePickerWheel;
