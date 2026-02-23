// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Constants from "expo-constants";

// Get Firebase configuration from environment variables or expo constants
const getFirebaseConfig = () => {
  const config = {
    apiKey:
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
      Constants.expoConfig?.extra?.firebaseApiKey,
    authDomain:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      Constants.expoConfig?.extra?.firebaseAuthDomain,
    projectId:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
      Constants.expoConfig?.extra?.firebaseProjectId,
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      Constants.expoConfig?.extra?.firebaseStorageBucket,
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      Constants.expoConfig?.extra?.firebaseMessagingSenderId,
    appId:
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
      Constants.expoConfig?.extra?.firebaseAppId,
    measurementId:
      process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ||
      Constants.expoConfig?.extra?.firebaseMeasurementId,
  };

  // Validate that we have the required configuration
  if (!config.apiKey || !config.projectId || !config.appId) {
    console.error(
      "Firebase Configuration Error: Missing required environment variables",
    );
    console.error("Please ensure these environment variables are set:");
    console.error("- EXPO_PUBLIC_FIREBASE_API_KEY");
    console.error("- EXPO_PUBLIC_FIREBASE_PROJECT_ID");
    console.error("- EXPO_PUBLIC_FIREBASE_APP_ID");

    throw new Error(
      "Firebase configuration is incomplete. Please check your environment variables.",
    );
  }

  return config;
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
