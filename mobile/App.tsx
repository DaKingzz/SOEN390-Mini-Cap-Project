import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import Constants from "expo-constants";
import GoogleMap from './GoogleMap';
import { GoogleSignin } from "@react-native-google-signin/google-signin";


export default function App() {
  const apiBaseUrl = (Constants.expoConfig?.extra as any)?.API_BASE_URL;
  const [result, setResult] = useState("Not tested yet");
  const [calendarEvents, setCalendarEvents] = useState("No events imported yet");

  useEffect(() => {
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],

      // Web OAuth client ID (from the web client you just created)
      webClientId: "511345858617-6dd93pjirlhn1k82scnvs9ovcpopd81u.apps.googleusercontent.com",

      // Required to get serverAuthCode
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);


  const testBackend = async () => {
    try {
      if (!apiBaseUrl) throw new Error("API_BASE_URL is missing (check .env + app.config.ts)");
      const res = await fetch(`${apiBaseUrl}/api/health`);
      const text = await res.text();
      setResult(text);
    } catch (e: any) {
      setResult(e?.message ?? String(e));
    }
  };

  const importGoogleCalendar = async () => {
    try {
      if (!apiBaseUrl) throw new Error("API_BASE_URL is missing");

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo = await GoogleSignin.signIn();
      const code = (userInfo as any)?.data?.serverAuthCode as string | undefined;

      if (!code) throw new Error("No serverAuthCode returned.");

      const res = await fetch(`${apiBaseUrl}/api/calendar/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverAuthCode: code,
          calendarName: "primary", // change to the name of the calendar you want to import
          days: 7,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      // Google returns items at: data.events.items
      const events = Array.isArray(data?.events?.items) ? data.events.items : [];

      const TZ = "America/Toronto";

      const startFmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      const timeFmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
      });

      const fmt = (ev: any) => {
        // all-day
        if (ev.start?.date && ev.end?.date) {
          const d = new Date(ev.start.date);
          return `${new Intl.DateTimeFormat("en-CA", {
            timeZone: TZ,
            weekday: "long",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(d)} (all-day)`;
        }

        const start = ev.start?.dateTime;
        const end = ev.end?.dateTime;
        if (!start || !end) return "(missing time)";

        return `${startFmt.format(new Date(start))} – ${timeFmt.format(new Date(end))}`;
      };

      const preview = events.slice(0, 20).map((ev: any) => {
        const course = ev.summary ?? "(no title)";
        const when = fmt(ev);
        const loc = ev.location ? ` @ ${ev.location}` : "";
        return `• ${course} - ${when}${loc}`;
      });

      setCalendarEvents(`Next 7 days: ${events.length} events\n\n` + preview.join("\n\n"));
      setResult("Imported via backend.");
    } catch (e: any) {
      console.log("IMPORT (BACKEND) ERROR:", e);
      setResult(e?.message ?? String(e));
    }
  };



  return (
     <View style={{ flex: 1 }}>

       <View style={styles.container}>
         <Text style={styles.title}>Backend Connectivity Test</Text>
         <Text style={styles.small}>API_BASE_URL: {apiBaseUrl ?? "(undefined)"}</Text>

         <View style={{ height: 16 }} />
         <Button title="Call /api/health" onPress={testBackend} />

         <View style={{ height: 16 }} />
         <Text style={styles.result}>Result: {result}</Text>


         <View style={{ height: 16 }} />
          <Button
            title="Import Schedule from Google Calendar"
            onPress={importGoogleCalendar}
          />

          <View style={{ height: 16 }} />
          <Text style={styles.result}>Events: {calendarEvents}</Text>

       </View>
     </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  small: { fontSize: 12 },
  result: { fontSize: 16 },
});
