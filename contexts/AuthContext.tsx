import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/services/firebaseConfig";

// Only import GoogleSignin for native platforms
let GoogleSignin: any = null;
if (Platform.OS !== "web") {
  const RNGoogleSignin = require("@react-native-google-signin/google-signin");
  GoogleSignin = RNGoogleSignin.GoogleSignin;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  error: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configure Google Sign-In for native platforms only
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      // Use different methods based on platform
      if (Platform.OS === "web") {
        // Web: Use Firebase's signInWithPopup
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        console.log("Successfully signed in with Google (web)");
      } else {
        // Native (iOS/Android): Use Google Sign-In library
        if (!GoogleSignin) {
          throw new Error("Google Sign-In not available on this platform");
        }

        // Check if device supports Google Play services
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });

        // Get user info from Google
        const userInfo = await GoogleSignin.signIn();

        // Get the ID token
        const idToken = userInfo.data?.idToken;

        if (!idToken) {
          throw new Error("Failed to get ID token from Google Sign-In");
        }

        // Create a Google credential with the token
        const googleCredential = GoogleAuthProvider.credential(idToken);

        // Sign in to Firebase with the Google credential
        await signInWithCredential(auth, googleCredential);

        console.log("Successfully signed in with Google (native)");
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || "Failed to sign in with Google");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);

      // Sign out from Google (native only)
      if (GoogleSignin) {
        await GoogleSignin.signOut();
      }

      // Sign out from Firebase
      await firebaseSignOut(auth);

      console.log("Successfully signed out");
    } catch (err: any) {
      console.error("Sign Out Error:", err);
      setError(err.message || "Failed to sign out");
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
