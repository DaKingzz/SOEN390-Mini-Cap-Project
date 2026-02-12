# SOEN390-Mini-Cap-Project
Team Name: Big Data Energy
Team Members:
1. Junior Boni 40287501
2. Adja Boye 40281923
3. Fouad Elian 40273045
4. Talar Mustafa 40284214
5. Andy Cai 40282940
6. Thomas Shizhuo Chen 40274703
7. Mathieu choueiry 40284714
8. Robert Louis Lando 40275679
9. Abdulah Ghulam Ali 40281857
10. Sergio Abreo Alvarez 40274677
11. Arturo Sanchez 40283236

## Setup

### Frontend

1. Inside `mobile/`, create a `.env` file containing:

```
# These are the url the phone needs to call as its "localhost", 8080 being the backend port
# This is for a simulator (Android Studio)
API_BASE_URL_EMULATOR=http://10.0.2.2:8080
# This is for a physical phone, add your own IP address (both pc and phone need to be on the same wifi)
API_BASE_URL_PHONE=http://IP_ADDRESS:8080
# Everyone can use the same emulator url so it is the default
TARGET=emulator

# Google Maps Keys (DO NOT COMMIT)
GOOGLE_MAPS_ANDROID_API_KEY=key_here
GOOGLE_MAPS_IOS_API_KEY=your_ios_key_here
```

2. Delete the `android` folder, then run:

```bash
npx expo prebuild --clean
npx expo run:android
```

This builds the app on the emulator (first time only — this command also runs the app). Once the setup is done, you can run the app with:

```bash
npx expo start --dev-client
```

You need to redo the prebuild process every time native changes are made to the app, not just UI stuff.

### Backend

1. Directly underneath `backend/`, create a file called `local.properties` and add:

```
GOOGLE_API_KEY=paste_here
```

2. Make sure your API key has the following APIs enabled:
   - Geolocation API
   - Directions API
   - Maps SDK Android
   - Places API (new)

With both backend and frontend running, everything should work.

### Troubleshooting

**SDK error:** Create an environment variable named `ANDROID_HOME` and set its value to the SDK path (you can find it in the SDK Manager of Android Studio). Save everything and try to build the project from scratch.
