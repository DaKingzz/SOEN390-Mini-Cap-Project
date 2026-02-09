# Google OAuth Setup — Web & Android Client IDs + SHA-1

This guide explains how to configure Google OAuth for an Android app and backend/web usage. It covers:
- Creating a **Web OAuth Client ID**
- Creating an **Android OAuth Client ID**
- Finding **SHA-1 fingerprints** (debug, release, Play App Signing)

---

## Prerequisites

- A Google Cloud account
- A Google Cloud project (or permission to edit one)
- Android package name (e.g. `com.soen390.conunav`)
- Access to Android Studio or command line (`keytool`)

---

## 1. Create or Select a Google Cloud Project

1. Go to Google Cloud Console
2. Create a new project or select an existing one
3. Navigate to **APIs & Services**

---

## 2. Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Select **External** (most apps) or **Internal** (Workspace-only)
3. Fill required fields:
   - App name
   - User support email
   - Developer contact email
4. Add required scopes (e.g. Google Calendar)
5. If in **Testing** mode, add test user emails (your gmail specifically)
6. Save

> OAuth will fail with access errors if test users are not added while in Testing mode.

---

## 3. Create Web Application OAuth Client ID

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Choose **Web application**
4. Configure:
   - Authorized JavaScript origins (if applicable)
   - Authorized redirect URIs (must match backend exactly) (http://localhost:8080/oauth2/google should work) 
5. Create the client
6. Copy:
   - **Client ID**
   - **Client Secret** (server-side only)

**Use cases**
- Backend exchanging auth code for tokens
- Requesting `serverAuthCode` from mobile app

---

## 4. Create Android OAuth Client ID

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Choose **Android**
4. Enter:
   - Android package name (com.soen390.conunav)
   - SHA-1 certificate fingerprint
   -To get SHA-1:
   Powershell:
                in the mobile/android directory of the project
                run .\gradlew signingReport
                Go to the Task :app:signingReport section
                then search for Variant: debug 
                copy the SHA-1 and paste to the Google Cloud page where it asks for SHA-1
    
    MacOS:
                in the mobile/android directory of the project
                run ./gradlew signingReport
                Go to the Task :app:signingReport section
                then search for Variant: debug 
                copy the SHA-1 and paste to the Google Cloud page where it asks for SHA-1

5. Create the client
6. Copy the **Android Client ID**

> You may need multiple Android OAuth clients for different SHA-1s (debug, release, Play Store).

---

## 5. Setup in the frontend

1.Go to mobile/.env and paste your Web Client Id 
    GOOGLE_WEB_CLIENT_ID=<YOUR_WEB_CLIENT_ID>.apps.googleusercontent.com

2.Go to mobile/app.json --> find expo.android.package --> write com.soen390.conunav

---

## 6. Setup in the backend

1.Go to backend/local.properties and paste your Web Client ID, Secret and redirect URI
    GOOGLE_OAUTH_CLIENT_ID=<YOUR_WEB_CLIENT_ID>.apps.googleusercontent.com
    GOOGLE_OAUTH_CLIENT_SECRET=<YOUR_SECRET>
    GOOGLE_OAUTH_REDIRECT_URI=<REDIRECT_URI> (http://localhost:8080/oauth2/google should work)

2. Restart backend

---

## 7. Running the new app 


1.In the mobile directory, first delete the old com.anonymous.mobile package by running "adb uninstall com.anonymous.mobile" (should return Success)

2.Then, in mobile directory again, run npx expo prebuild --clean

3.You can now run the app with npx expo run:android (Make sure to restart the backend)

