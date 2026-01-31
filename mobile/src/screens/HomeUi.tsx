import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import SearchBar from "../components/SearchBar";
import CampusSwitcher from "../components/CampusSwitcher";
import BottomNav from "../components/BottomNav";
import FloatingActionButton from "../components/FloatingActionButton";
import SearchPanel from "../components/SearchPanel";
import SettingsScreen from "./SettingsScreen";
import ShuttleScreen from "./ShuttleScreen";

type Tab = "settings" | "map" | "shuttle";

export default function HomeUi() {
  const [campus, setCampus] = useState<"SGW" | "LOYOLA">("SGW");
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [searchOpen, setSearchOpen] = useState(false);

  const renderContent = () => {
    if (activeTab === "settings") return <SettingsScreen />;
    if (activeTab === "shuttle") return <ShuttleScreen />;

    // Map page (placeholder)
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderText}>Map goes here (later)</Text>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Always render the active page content */}
      {renderContent()}

      {/* Only show these overlays on the "map" tab */}
      {activeTab === "map" && (
        <>
          <View style={styles.searchWrapper}>
            <SearchBar placeholder="Search" onPress={() => setSearchOpen(true)} />
          </View>

          <SearchPanel visible={searchOpen} onClose={() => setSearchOpen(false)} />

          <FloatingActionButton onPress={() => {}} />

          <View style={styles.campusWrapper}>
            <CampusSwitcher value={campus} onChange={setCampus} />
          </View>
        </>
      )}

      {/* Always show Bottom Nav */}
      <BottomNav value={activeTab} onChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#EAEAEA",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { fontSize: 16, opacity: 0.6 },

  searchWrapper: { position: "absolute", top: 50, left: 16, right: 16 },

  campusWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 90,
    alignItems: "center",
  },
});
