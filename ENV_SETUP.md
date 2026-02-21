# Environment Variables Setup Guide

## Overview

Your app uses environment variables to securely store Firebase credentials and Google OAuth configuration. This keeps sensitive data out of your source code.

## Files Created

1. **`.env`** - Your actual credentials (⚠️ NEVER commit to git)
2. **`.env.example`** - Template for team members (safe to commit)
3. **`.gitignore`** - Updated to exclude `.env`

## Getting Your Credentials

### 1. Firebase Credentials

Go to [Firebase Console](https://console.firebase.google.com/):

1. Select your project
2. Click **Project Settings** (gear icon)
3. Scroll down to **"Your apps"**
4. Click on your **Web app**
5. Copy all values from the `firebaseConfig` object

### 2. Google Web Client ID

In the same **Project Settings**:

1. Go to **"Service Accounts"** tab
2. Look for the **Web Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
3. Or, in **"OAuth consent screen"** → **"Credentials"** → Find your Web Client ID

## Filling Out Your `.env` File

Open `.env` and fill in your actual credentials:

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

## Environment Variable Naming

**Important**: All variables must start with `EXPO_PUBLIC_` to be accessible in your Expo app!

```typescript
✅ EXPO_PUBLIC_FIREBASE_API_KEY     // Accessible in code
❌ FIREBASE_API_KEY                 // NOT accessible in Expo
❌ SECRET_API_KEY                   // NOT accessible in Expo
```

## How They're Used

### Firebase Config ([`services/firebaseConfig.ts`](../services/firebaseConfig.ts))

```typescript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... other values
};
```

### Google Sign-In ([`contexts/AuthContext.tsx`](../contexts/AuthContext.tsx))

```typescript
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});
```

## Security Best Practices

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

## Testing Your Setup

1. Fill in your `.env` file with real credentials
2. Start the dev server:
   ```bash
   npx expo start
   ```
3. Open the app on a device/simulator
4. You should see the sign-in modal with the working cat
5. Tap "Sign in with Google" to test authentication

## Troubleshooting

### "undefined" in Firebase Config

- Make sure your variables start with `EXPO_PUBLIC_`
- Restart the dev server after changing `.env`
- Check that `.env` is in the root of `TaskManagerApp/`

### Google Sign-In Not Working

- Verify `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is correct (Web Client ID, not Android/iOS)
- Make sure Google Sign-In is enabled in Firebase → Authentication

### Variables Not Loading

- Restart: `npx expo start --clear`
- Check file is named exactly `.env` (not `.env.local`)
- Variables take effect after restart

## Next Steps

1. ✅ Fill in your `.env` file
2. ✅ Restart the dev server
3. ✅ Test sign-in on your device
4. ✅ Share `.env.example` with team
5. ✅ For Android: Add SHA-1 fingerprint to Firebase (optional for now)

## Android SHA-1 Setup (Optional)

When you're ready to build for Android:

1. Generate native Android files:

   ```bash
   npx expo prebuild --platform android
   ```

2. Get SHA-1:

   ```bash
   cd android
   ./gradlew signingReport
   ```

3. Add to Firebase Console → Project Settings → Your apps → Android app → SHA certificate fingerprints

For now, focus on testing with Expo!
