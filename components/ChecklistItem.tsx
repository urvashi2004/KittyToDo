import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";

interface ChecklistItemType {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistItemProps {
  item: ChecklistItemType;
  onChange: (text: string) => void;
  onToggle: () => void;
  onDelete: () => void;
}

export default function ChecklistItem({
  item,
  onChange,
  onToggle,
  onDelete,
}: ChecklistItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
        <View
          style={[
            styles.checkboxInner,
            item.completed && styles.checkboxChecked,
          ]}
        >
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, item.completed && styles.completedInput]}
        value={item.text}
        onChangeText={onChange}
        placeholder="Enter checklist item"
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  completedInput: {
    textDecorationLine: "line-through",
    color: "#999",
    backgroundColor: "#f9f9f9",
  },
  deleteButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    fontSize: 28,
    color: "#FF3B30",
    fontWeight: "300",
  },
});
