import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchBar({
  placeholder,
  onPress,
}: {
  placeholder: string;
  onPress: () => void;
}) {
  return (
    
    <Pressable onPress={onPress} style={styles.container}>
      <Ionicons name="search" size={18} />
      <Text style={styles.text}>{placeholder}</Text>
      <View style={styles.spacer} />
      <Ionicons name="mic" size={18} />
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    // Shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  text: {
    opacity: 0.65,
    fontSize: 15,
  },
  spacer: {
    flex: 1,
  },
});
