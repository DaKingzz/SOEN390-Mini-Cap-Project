import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import Constants from "expo-constants";
import UpcomingEventButton from "./UpcomingEventButton";
import GoogleMap from "./GoogleMap";

export default function App() {
  const apiBaseUrl = (Constants.expoConfig?.extra as any)?.API_BASE_URL;

  const testBackend = async () => {
    // keep your health test if you want
    try {
      if (!apiBaseUrl) throw new Error("API_BASE_URL is missing (check .env + app.config.ts)");
      const res = await fetch(`${apiBaseUrl}/api/health`);
      const text = await res.text();
      console.log(text);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      
      <View style={{ flex: 1 }}>
        <GoogleMap />
      </View>
      
      <View style={styles.container}>
        <Text style={styles.title}>Backend Connectivity Test</Text>
        <Text style={styles.small}>API_BASE_URL: {apiBaseUrl ?? "(undefined)"}</Text>

        <View style={{ height: 16 }} />
        <Button title="Call /api/health" onPress={testBackend} />

        <View style={{ height: 16 }} />
        <UpcomingEventButton apiBaseUrl={apiBaseUrl} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  small: { fontSize: 12 },
});
