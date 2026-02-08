import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BURGUNDY = "#800020";
type Tab = "settings" | "map" | "shuttle";

export default function BottomNav({
  value,
  onChange,
}: {
  value: Tab;
  onChange: (v: Tab) => void;
}) {
  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.item} onPress={() => onChange("settings")}>
        <Ionicons name={value === "settings" ? "settings" : "settings-outline"} color={BURGUNDY} size={22} />
      </Pressable>

      <Pressable style={styles.item} onPress={() => onChange("map")}>
        <Ionicons name={value === "map" ? "location" : "location-outline"} color={BURGUNDY} size={22} />
      </Pressable>

      <Pressable style={styles.item} onPress={() => onChange("shuttle")}>
        <Ionicons name={value === "shuttle" ? "bus" : "bus-outline"} color={BURGUNDY} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 78,
    paddingBottom: 18,
    paddingTop: 10,
    paddingHorizontal: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.98)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    // Shadow
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  item: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },
});
