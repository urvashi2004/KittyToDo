# Kitty To Do 🐱✅

A delightful task management app with a cute cat theme! Built with [Expo](https://expo.dev) and React Native.

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   npx expo start
   ```

3. Choose how to run:
   - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go) - Limited sandbox for app testing

You can start developing by editing files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

---

## 📋 Setup Guide

### Environment Variables Setup

Your app uses environment variables to securely store Firebase credentials and Google OAuth configuration. This keeps sensitive data out of your source code.

#### Getting Your Credentials

**Firebase Credentials:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Scroll down to **"Your apps"**
5. Click on your **Web app**
6. Copy all values from the `firebaseConfig` object

**Google Web Client ID:**

1. In **Project Settings** → **"OAuth consent screen"** → **"Credentials"**
2. Find your Web Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)

#### Creating Your `.env` File

Create a `.env` file in your project root and fill in your actual credentials:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxx...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=yourproject
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd1234efgh5678
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCD1234EF

# Google Sign-In
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

**Note:** The `.env` file is added to `.gitignore` and should never be committed to git. Use `.env.example` as a template for team members.

**Important:** All variables must start with `EXPO_PUBLIC_` to be accessible in your Expo app!

#### Security Best Practices

✅ **DO:**

- Keep `.env` on your local machine only
- Add `.env` to `.gitignore` (already done)
- Share `.env.example` with team members as a template
- Use different Firebase projects for dev/prod
- Rotate keys periodically

❌ **DON'T:**

- Commit `.env` to git
- Share your actual `.env` file
- Use the same Firebase project for testing and production
- Hardcode credentials in code

#### Testing Your Setup

1. Fill in your `.env` file with real credentials
2. Start the dev server:
   ```bash
   npx expo start
   ```
3. Open the app on a device/simulator
4. You should see the sign-in modal with the working cat
5. Tap "Sign in with Google" to test authentication

---

### 🔐 Google OAuth & Firebase Setup

Google OAuth has been integrated into your Kitty To Do app. Users will see a sign-in modal when the app loads if they're not authenticated.

#### Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon)
4. Scroll down to "Your apps" and add an Android/iOS app

#### Enable Google Sign-In

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Click **Enable**
4. Set a support email
5. Click **Save**

#### Android Setup (for Android builds)

1. Generate native Android files:

   ```bash
   npx expo prebuild --platform android
   ```

2. Get SHA-1 certificate fingerprint:

   ```bash
   cd android
   ./gradlew signingReport
   ```

3. Add SHA-1 to Firebase:
   - Go to **Firebase Console** → **Project Settings** → **Your apps**
   - Click on your Android app
   - Add the SHA-1 certificate fingerprint

4. Download `google-services.json`:
   - In Firebase Console, download the updated file
   - Place it in `android/app/` directory

#### iOS Setup (for iOS builds)

1. Download `GoogleService-Info.plist`:
   - Go to **Firebase Console** → **Project Settings** → **Your apps**
   - Click on your iOS app
   - Download the plist file
   - Place it in the `ios/` directory

2. Add URL schemes:
   - Open `ios/KittyToDo/Info.plist`
   - Add your reversed client ID as a URL scheme

#### Features Implemented

✅ **Sign-In Modal** - Appears automatically when app loads if not authenticated
✅ **Auth Context** - Manages authentication state globally with `useAuth()` hook
✅ **Sign-Out Feature** - Sign-out button in the Tasks screen header with confirmation
✅ **Protected Routes** - App content only accessible after authentication
✅ **Loading Screen** - Shows while checking authentication state with cat animation
✅ **Error Handling** - User-friendly error messages during sign-in

#### Testing Authentication

1. Run the app:

   ```bash
   npx expo start
   ```

2. Test sign-in flow:
   - App should show the sign-in modal
   - Tap "Sign in with Google"
   - Complete Google authentication
   - You should be redirected to the main app

3. Test sign-out:
   - Tap "Sign Out" button in tasks screen
   - Confirm sign-out in the dialog
   - Sign-in modal should appear again

#### Troubleshooting

**"Sign-in failed" error**

- Check Web Client ID (use Web Client ID, not Android/iOS client ID)
- Verify Google Sign-In is enabled in Firebase Console → Authentication

**"Developer Error" on Android**

- Make sure you added the SHA-1 to Firebase
- Ensure `google-services.json` is in the correct location and up-to-date

**User is null after sign-in**

- Verify all Firebase config values in `.env` are correct
- Make sure `onAuthStateChanged` is working properly
- Check browser console for any errors

**hasPlayServices error**

- Update Google Play Services on your device
- Verify you're on a real Android device with Play Services (emulator may not work)

---

## 🎨 App Logo & Branding

Your app name has been updated to **"Kitty To Do"** throughout:

- **app.json** - Display name and slug
- **package.json** - Package name
- **Android Package ID** - `com.kittytodo.app`
- **URL Scheme** - `kittytodo`

### Creating Your App Logo

You have several cat images in `assets/animals/` that can be used for your logo:

- `WorkingCat.jpg` - Professional looking cat
- `SusCat.jpg` - Cute/funny cat
- `ExerciseCat.jpg` - Active cat

#### Quick Start with Icon Generator

1. Choose your cat image from `assets/animals/`
2. Go to [App Icon Generator](https://www.appicon.co/)
3. Upload your cat image
4. Download all generated icons
5. Replace these files in `assets/images/`:
   ```
   icon.png (1024x1024) - Main iOS icon
   android-icon-foreground.png (432x432) - Android foreground
   android-icon-background.png (432x432) - Android background
   android-icon-monochrome.png (432x432) - Android monochrome
   splash-icon.png (200x200) - Splash screen icon
   favicon.png (48x48) - Web favicon
   ```

#### Design Suggestions

**Logo Concept Ideas:**

1. **Cat with Checklist** - A cute cat holding or sitting next to a checklist with checkmarks visible
2. **Cat Paw with Check** - A cat paw print with a checkmark - simple and recognizable
3. **Working Cat** - Use your `WorkingCat.jpg` with a blue background and small checklist icon overlay
4. **Minimalist Cat Face** - Simple cat face outline with checklist pattern in background

**Recommended Color Scheme:**

- Primary: #007AFF (iOS Blue)
- Background: #E6F4FE (Light Blue)
- Accent: #FFFFFF (White)
- Text: #333333 (Dark Gray)

#### After Creating Icons

1. Replace the icon files in `assets/images/`
2. Clear cache and prebuild:
   ```bash
   npx expo prebuild --clean
   ```
3. Rebuild your app:

   ```bash
   # For EAS Build (Recommended)
   eas build --platform android --profile preview

   # For local build
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

#### Icon Checklist

- [ ] Create main icon (1024x1024)
- [ ] Create Android foreground icon (432x432)
- [ ] Create Android background icon (432x432)
- [ ] Create Android monochrome icon (432x432)
- [ ] Create splash icon (200x200)
- [ ] Create favicon (48x48)
- [ ] Replace files in `assets/images/`
- [ ] Test in Expo Go
- [ ] Rebuild APK
- [ ] Test on device

---

## 📱 MIUI Device Troubleshooting

### Issues Fixed

1. ✅ **Added Error Boundary** - Catches and displays startup errors instead of blank screen crashes
2. ✅ **Improved Firebase Configuration** - Validates missing environment variables with detailed error logging
3. ✅ **Added Android Permissions** - INTERNET, ACCESS_NETWORK_STATE, WAKE_LOCK, RECEIVE_BOOT_COMPLETED, VIBRATE

### MIUI-Specific Settings

After installing the APK on a MIUI device, you MUST configure these settings:

#### A. Allow Autostart

1. Go to **Settings** > **Apps** > **Manage Apps**
2. Find **Kitty To Do**
3. Tap on **Autostart** and enable it

#### B. Disable Battery Saver

1. Go to **Settings** > **Apps** > **Manage Apps**
2. Find **Kitty To Do**
3. Tap on **Battery saver** > Select **No restrictions**

#### C. Grant All Permissions

1. Go to **Settings** > **Apps** > **Manage Apps**
2. Find **Kitty To Do**
3. Tap on **App permissions**
4. Allow all requested permissions

#### D. Background Activity

1. In the same app settings page
2. Enable **Display pop-up windows while running in the background**

#### E. Privacy Protection (MIUI 12+)

1. Go to Settings > **Privacy Protection**
2. Find **Kitty To Do** and allow all permissions

#### F. Lock App in Recents (Optional)

1. Swipe up to open Recent Apps
2. Swipe down on Kitty To Do to lock it
3. This prevents MIUI from aggressively closing it

### Common MIUI Issues and Solutions

**App still crashes immediately**

- Go to Settings > Privacy Protection
- Find Kitty To Do and allow all permissions
- Restart the app

**Firebase not connecting**

- Ensure you have internet connection
- Check Firebase console to verify your app is registered
- Verify your Firebase config values in `.env` are correct
- Check that you've verified your email in Firebase

**Google Sign-In not working**

- Verify you have Play Services installed on your device
- Check that your SHA-1 fingerprint is added to Firebase
- Ensure Google Sign-In is enabled in Firebase Console
- Try clearing app cache: Settings > Apps > Kitty To Do > Storage > Clear Cache

**App works but closes in background**

- Follow section B above to disable battery restrictions
- Enable Autostart (section A)
- Lock the app in Recent Apps (section F)

**App shows blank screen then closes**

- Check the error boundary message if it appears
- Verify your Firebase configuration in `.env`
- Ensure internet connection is working

### Debug Mode

To see detailed logs:

1. Connect your device via USB
2. Enable USB Debugging: Settings > Developer Options > USB Debugging
3. Install ADB if you haven't already
4. Run: `adb logcat | grep -i "KittyToDo\|Firebase\|Google"`

This will show you any error messages in real-time.

### Common Error Messages and Fixes

- **"Firebase configuration is incomplete"** → Check your environment variables in `.env`
- **"Google Sign-In not available"** → Install or update Google Play Services
- **"Network request failed"** → Check internet permission and connection
- **"hasPlayServices"** → Update Google Play Services on your device
- **"Failed to get ID token"** → Verify your Google Web Client ID is correct
- **"NETWORK_ERROR"** → Check that your device has internet access

### Getting SHA-1 Fingerprint for Google Sign-In

For your APK to work with Google Sign-In on MIUI:

```bash
# For debug builds
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release builds (if you have a keystore)
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

Add the SHA-1 fingerprint to your Firebase project settings in the Android app configuration.

---

## 📦 Building APK

### For Testing (Preview)

```bash
npx expo prebuild --clean
eas build --platform android --profile preview
```

### For Production

```bash
eas build --platform android --profile production
```

### Local Build

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📚 Learn More

To learn more about developing your project with Expo:

- [Expo documentation](https://docs.expo.dev/) - Learn fundamentals and advanced topics
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/) - Step-by-step guide
- [Firebase Docs](https://firebase.google.com/docs/auth) - Firebase Authentication documentation
- [Expo on GitHub](https://github.com/expo/expo) - View open source platform and contribute
- [Discord community](https://chat.expo.dev) - Chat with Expo users and ask questions

---

## 🔄 Fresh Project

When you're ready to start fresh, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory.

---

## 🎯 Project Features

- ✅ **Google Authentication** - Sign in with Google using Firebase
- ✅ **Task Management** - Create, update, and delete tasks
- ✅ **Mood Tracker** - Track your daily moods with color-coded calendar
- ✅ **Activity Logging** - Log activities and wellness data
- ✅ **Real-time Sync** - Data synced to Firebase Firestore
- ✅ **Error Boundary** - Graceful error handling with user feedback
- ✅ **MIUI Optimization** - Tested and optimized for MIUI devices
- ✅ **Responsive Design** - Works on phones and tablets
- ✅ **Beautiful UI** - Modern design with cat-themed branding

---

## 📞 Support

If you need help or have issues:

1. Check the relevant section above (Setup Guide, Firebase Setup, MIUI Troubleshooting)
2. Check error messages from the Error Boundary in the app
3. Review Firebase Console for any warnings or errors
4. Check your network connection and internet access
5. Refer to [Expo Discord](https://chat.expo.dev) community for additional help
