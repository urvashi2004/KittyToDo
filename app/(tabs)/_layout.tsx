import { Tabs } from "expo-router";
import React from "react";
import { Image, StyleSheet, View, Text } from "react-native";
import dayjs from "dayjs";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="todo"
        options={{
          title: "To-Do",
          tabBarIcon: () => (
            <Image
              source={require("@/assets/animals/List.jpg")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: () => (
            <View style={styles.calendarIcon}>
              <Text style={styles.calendarLabel}>Today</Text>
              <Text style={styles.calendarDate}>{dayjs().format("D")}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: () => (
            <Image
              source={require("@/assets/animals/Calender.jpg")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: "Wellness",
          tabBarIcon: () => (
            <Image
              source={require("@/assets/animals/SmileyFace.png")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 28,
    height: 28,
  },
  wellnessIcon: {
    fontSize: 24,
  },
  calendarIcon: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: Colors["light"].tint,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  calendarLabel: {
    fontSize: 6,
    fontWeight: "600",
    color: Colors["light"].tint,
    lineHeight: 6,
  },
  calendarDate: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors["light"].tint,
    lineHeight: 10,
  },
});
