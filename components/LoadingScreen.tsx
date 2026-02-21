import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Shadows } from "@/constants/theme";

const { width } = Dimensions.get("window");

export default function LoadingScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Animate the cat image entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Working Cat Image */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("@/assets/animals/WorkingCat.jpg")}
          style={styles.catImage}
          contentFit="contain"
        />
      </Animated.View>

      {/* Loading Text */}
      <Text style={styles.loadingText}>Loading Your Tasks...</Text>

      {/* Loader */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>

      {/* Optional: Progress indicator text */}
      <Text style={styles.subText}>Getting everything ready</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  imageContainer: {
    marginBottom: 40,
    ...Shadows.extraLarge,
    borderRadius: 20,
    overflow: "hidden",
  },
  catImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  loaderContainer: {
    marginBottom: 16,
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
