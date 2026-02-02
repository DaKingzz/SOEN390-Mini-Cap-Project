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

      await GoogleSignin.signIn();

      const { accessToken } = await GoogleSignin.getTokens();
      if (!accessToken) throw new Error("No access token returned.");

      // Next 7 days window
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // If you want a specific calendar (not primary), replace "primary" with that calendarId
      const listRes = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const listData = await listRes.json();
      const calendars = Array.isArray(listData.items) ? listData.items : [];

      const target = calendars.find((c: any) => c.summary === "Abdulah");
      if (!target?.id) throw new Error("Calendar 'Abdulah' not found.");
      console.log("calendar id:", target.id);

      const calendarId = target.id;

      // 2) Fetch events from that calendar   
      const eventsRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
          `?timeMin=${encodeURIComponent(timeMin)}` +
          `&timeMax=${encodeURIComponent(timeMax)}` +
          `&singleEvents=true` +
          `&orderBy=startTime` +
          `&maxResults=250` +
          `&timeZone=${encodeURIComponent("America/Montreal")}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );


      if (!eventsRes.ok) {
        const text = await eventsRes.text();
        throw new Error(`Events API error: ${text}`);
      }

      const eventsData = await eventsRes.json();
      const events = Array.isArray(eventsData.items) ? eventsData.items : [];

      const TZ = "America/Montreal";

      const weekdayFmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        weekday: "long",
      });

      const dateFmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const startDateTimeFmt = new Intl.DateTimeFormat("en-CA", {
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
        // All-day
        if (ev.start?.date && ev.end?.date) {
          const d = new Date(ev.start.date);
          const day = weekdayFmt.format(d);
          const date = dateFmt.format(d);
          return `${day} ${date} (all-day)`;
        }

        // Timed
        const start = ev.start?.dateTime;
        const end = ev.end?.dateTime;
        if (!start || !end) return "(missing time)";

        const startStr = startDateTimeFmt.format(new Date(start)); // includes weekday + date + start time
        const endStr = timeFmt.format(new Date(end));              // just end time
        return `${startStr} – ${endStr}`;
      };


      const preview = events.slice(0, 20).map((ev: any) => {
        const course = ev.summary ?? "(no title)";
        const when = fmt(ev);
        const loc = ev.location ? ` @ ${ev.location}` : "";
        return `• ${course} - ${when}${loc}`;
      });

      setCalendarEvents(`Next 7 days: ${events.length} events\n\n` + preview.join("\n\n"));

    } catch (e: any) {
      console.log("GOOGLE SIGN-IN ERROR (raw):", e);
      console.log("GOOGLE SIGN-IN ERROR (string):", JSON.stringify(e));
      setResult(e?.message ?? JSON.stringify(e));
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
