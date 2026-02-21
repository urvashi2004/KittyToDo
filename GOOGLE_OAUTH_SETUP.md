# Google OAuth Setup Guide for TaskManager App

## Overview

Google OAuth has been integrated into your TaskManager app. Users will see a sign-in modal when the app loads if they're not authenticated.

## 🔧 Configuration Steps

### 1. Firebase Console Setup

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon)
4. Scroll down to "Your apps" and add an Android/iOS app if you haven't already

### 2. Enable Google Sign-In in Firebase

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Click **Enable**
4. Set a support email
5. Click **Save**

### 3. Get Web Client ID

1. In Firebase Console, go to **Project Settings**
2. Scroll to "Your apps" section
3. Find your **Web app** (if you don't have one, add it)
4. Copy the **Web Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)

### 4. Update Configuration Files

#### Update `contexts/AuthContext.tsx`

Replace `YOUR_WEB_CLIENT_ID` with your actual Web Client ID:

```typescript
GoogleSignin.configure({
  webClientId: "YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com",
  offlineAccess: true,
});
```

#### Update `services/firebaseConfig.ts`

Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};
```

You can find all these values in **Firebase Console** → **Project Settings** → scroll down to your app.

### 5. Android Setup (for Android builds)

1. **Get SHA-1 certificate fingerprint:**

```bash
# For debug builds
cd android
./gradlew signingReport

# Or use keytool (Windows)
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

2. **Add SHA-1 to Firebase:**
   - Go to **Firebase Console** → **Project Settings** → **Your apps**
   - Click on your Android app
   - Add the SHA-1 certificate fingerprint

3. **Download google-services.json:**
   - In Firebase Console, download the updated `google-services.json`
   - Place it in `android/app/` directory

### 6. iOS Setup (for iOS builds)

1. **Download GoogleService-Info.plist:**
   - Go to **Firebase Console** → **Project Settings** → **Your apps**
   - Click on your iOS app
   - Download `GoogleService-Info.plist`
   - Place it in the `ios/` directory

2. **Add URL schemes:**
   - Open `ios/TaskManagerApp/Info.plist`
   - Add your reversed client ID as a URL scheme

## 📱 Features Implemented

### ✅ Sign-In Modal

- Appears automatically when app loads if user is not authenticated
- Clean, modern UI with Google branding
- Error handling with user-friendly messages
- Loading states during authentication

### ✅ Auth Context

- Manages authentication state globally
- Provides `user`, `loading`, `signInWithGoogle`, and `signOut` functions
- Automatically syncs with Firebase Auth state

### ✅ Sign-Out Feature

- Sign-out button in the Tasks screen header
- Shows user's email in the header
- Confirmation dialog before signing out
- Properly signs out from both Google and Firebase

### ✅ Protected Routes

- App content only accessible after authentication
- Seamless redirect to sign-in modal when not authenticated
- Loading screen while checking authentication state

## 🧪 Testing

1. **Run the app:**

```bash
npx expo start
```

2. **Test sign-in flow:**
   - App should show the sign-in modal
   - Tap "Sign in with Google"
   - Complete Google authentication
   - You should be redirected to the main app

3. **Test sign-out:**
   - Tap "Sign Out" button in tasks screen
   - Confirm sign-out
   - Sign-in modal should appear again

## 🔍 Troubleshooting

### "Sign-in failed" error

- **Check Web Client ID:** Make sure you're using the Web Client ID, not Android/iOS client ID
- **Enable Google Sign-In:** Verify it's enabled in Firebase Console → Authentication

### "Developer Error" on Android

- **SHA-1 fingerprint:** Make sure you added the SHA-1 to Firebase
- **google-services.json:** Ensure the file is in the correct location and up-to-date

### User is null after sign-in

- **Check Firebase config:** Verify all Firebase config values are correct
- **Auth state listener:** Make sure `onAuthStateChanged` is working properly

## 📝 Next Steps

1. **Configure Firebase:** Add your Firebase credentials
2. **Add SHA-1 fingerprint:** For Android development
3. **Test authentication:** Try signing in and out
4. **Implement data sync:** Connect tasks to Firebase Firestore with user ID
5. **Add profile screen:** Show more user info and settings

## 🔐 Security Notes

- Never commit your `firebaseConfig` with real credentials to public repositories
- Use environment variables for sensitive data in production
- The Web Client ID is safe to include in your app
- Always validate user permissions on the backend (Firebase Security Rules)

## 📚 Useful Links

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
