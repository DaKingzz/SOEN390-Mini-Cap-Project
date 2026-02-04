import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const BURGUNDY = "#800020";

// To adjust if we add more content later
const CARD_HEIGHT = 220;

export default function BuildingPopup({
  name,
  addressLines,
  onClose,
  onDirections,
}: {
  name: string;
  addressLines: string[];
  onClose: () => void;
  onDirections: () => void;
}) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{name}</Text>

          <View style={styles.headerRight}>
            <Text style={styles.logo}>P</Text>
            <FontAwesome name="wheelchair" size={24} color="black" />

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#111" />
            </Pressable>
          </View>
        </View>

        {addressLines.map((line, idx) => (
          <Text key={idx} style={styles.address}>
            {line}
          </Text>
        ))}

        <Text style={styles.sectionLabel}>
          Departments: <Text style={styles.muted}>...</Text>
        </Text>
        <Text style={styles.sectionLabel}>
          Services: <Text style={styles.muted}>...</Text>
        </Text>

        <Pressable onPress={onDirections} style={styles.directionsBtn}>
          <FontAwesome5 name="directions" size={18} color="white" />
          <Text style={styles.directionsText}>Directions</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  card: {
    width: "100%",
    maxWidth: 520,
    height: CARD_HEIGHT,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: "800", flex: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { fontSize: 22, fontWeight: "900" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  address: { color: "#333", marginTop: 2 },
  sectionLabel: { marginTop: 10, fontWeight: "800" },
  muted: { color: "#444", fontWeight: "600" },

  directionsBtn: {
    marginTop: 14,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: BURGUNDY,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  directionsText: { color: "#fff", fontWeight: "800" },
});
