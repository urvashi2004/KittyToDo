import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  showSettingsButton?: boolean;
}

export default function Navbar({ showSettingsButton = true }: NavbarProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  return (
    <View style={styles.navbar}>
      {/* App Icon on Left */}
      <Image
        source={require("@/assets/images/icon.png")}
        style={styles.appIcon}
      />

      {/* Your Tasks Title Centered */}
      <View style={styles.centerSection}>
        <Text style={styles.appName}>Your Tasks</Text>
      </View>

      {/* User Profile Picture on the Right */}
      {showSettingsButton && (
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleSettingsPress}
          activeOpacity={0.7}
        >
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 12,
        marginTop: 20,
      },
    }),
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
