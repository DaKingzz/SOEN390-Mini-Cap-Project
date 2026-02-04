import React from "react";
import { StyleSheet, Text, View } from "react-native";

const BURGUNDY = "#800020";

export default function BuildingMarker({ label }: { label: string }) {
  return (
    <View style={styles.pinWrap}>
      <View style={styles.pin}>
        <Text style={styles.text}>{label}</Text>
      </View>
      <View style={styles.tip} />
    </View>
  );
}

const styles = StyleSheet.create({
  pinWrap: { alignItems: "center" },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BURGUNDY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  text: { color: "#fff", fontWeight: "800", fontSize: 13 },
  tip: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: BURGUNDY,
  },
});
