import React, { useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import Constants from "expo-constants";

export default function App() {
  const apiBaseUrl = (Constants.expoConfig?.extra as any)?.API_BASE_URL;
  const [result, setResult] = useState("Not tested yet");

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connectivity Test</Text>
      <Text style={styles.small}>API_BASE_URL: {apiBaseUrl ?? "(undefined)"}</Text>

      <View style={{ height: 16 }} />
      <Button title="Call /api/health" onPress={testBackend} />

      <View style={{ height: 16 }} />
      <Text style={styles.result}>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  small: { fontSize: 12 },
  result: { fontSize: 16 },
});
