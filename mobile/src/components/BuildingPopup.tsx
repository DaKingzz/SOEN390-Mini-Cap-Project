import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Foundation from '@expo/vector-icons/Foundation';

const BURGUNDY = "#800020";

export default function BuildingPopup({
  id,
  name,
  addressLines,
  openingHours,
  hasStudySpots,
  image,
  accessibility,
  onClose,
  onDirections,
}: {
  id: string;
  name: string;
  addressLines: string[];
  openingHours: string;
  hasStudySpots: boolean;
  image: any;
  accessibility: {
    hasElevator: boolean;
    hasParking: boolean;
    isAccessible: boolean;
  };
  onClose: () => void;
  onDirections: () => void;
}) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        {/* Image */}
        <Image source={image} style={styles.image} resizeMode="cover" />

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{name}</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Accessibility icons (conditional) */}
            <View style={styles.iconsRow}>
              {accessibility.hasParking && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>P</Text>
                </View>
              )}

              {accessibility.hasElevator && (
                <Foundation name="elevator" size={20} color={BURGUNDY} />
              )}

              {accessibility.isAccessible && (
                <FontAwesome name="wheelchair" size={20} color={BURGUNDY} />
              )}
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#111" />
            </Pressable>
          </View>
        </View>

        {/* Address */}
        {addressLines.map((line, idx) => (
          <Text key={idx} style={styles.address}>
            {line}
          </Text>
        ))}

        {/* Opening hours + study spots */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Hours:</Text>
          <Text style={styles.metaValue}>{openingHours}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Study Spots:</Text>
          <Text style={styles.metaValue}>{hasStudySpots ? "Yes" : "No"}</Text>
        </View>

        {/* Directions button */}
        <Pressable onPress={onDirections} style={styles.directionsBtn}>
          <FontAwesome5 name="directions" size={18} color="#fff" />
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
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  image: {
    width: "100%",
    height: 120,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
  },

  title: { fontSize: 18, fontWeight: "800" },
  code: { marginTop: 2, color: "#666", fontWeight: "700" },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  badge: {
    backgroundColor: BURGUNDY,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontWeight: "900" },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  address: {
    color: "#333",
    marginTop: 4,
    paddingHorizontal: 14,
  },

  metaRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  metaLabel: { fontWeight: "800" },
  metaValue: { color: "#333", fontWeight: "600" },

  sectionLabel: {
    marginTop: 10,
    fontWeight: "800",
    paddingHorizontal: 14,
  },
  muted: { color: "#444", fontWeight: "600" },

  directionsBtn: {
    marginTop: 12,
    marginBottom: 14,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: BURGUNDY,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 14,
  },
  directionsText: { color: "#fff", fontWeight: "800" },
});
