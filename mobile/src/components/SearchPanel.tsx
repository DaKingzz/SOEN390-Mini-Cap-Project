import React, { useState, useEffect, useRef } from "react";
import { View,Text, TextInput, FlatList,TouchableOpacity,StyleSheet,Pressable,Modal, ScrollView} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BURGUNDY = "#800020";

const FILTERS = ["Restrooms", "Restaurants", "Classes", "Coffee", "Libraries"];

const RECENTS = [
  {
    id: "1",
    name: "Hall Building Auditorium",
    address: "1455 Blvd. De Maisonneuve Ouest",
  },
  {
    id: "2",
    name: "Pavillon EV Building",
    address: "1515 Rue Sainte-Catherine #1428",
  },
  {
    id: "3",
    name: "John Molson School of Business",
    address: "1450 Guy St, Montreal, QC H3H 0A1",
  },
];

const NEARBY = [
  {
    id: "1",
    name: "Hall Building Auditorium",
    floor: "Floor 2",
    distance: "3 min walk · 120m",
  },
  {
    id: "2",
    name: "Science Center North",
    floor: "Floor 1",
    distance: "5 min walk · 250m",
  },
];

export default function SearchPanel({visible, onClose,}: {visible: boolean; onClose: () => void;}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Restrooms");
   const inputRef = useRef<TextInput>(null);

   useEffect(() => {
    if (visible) {
      setQuery("");
      // focus after modal opens
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>

      {/* backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />
      {/* panel */}
      <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Search</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20}/>
          <TextInput
            placeholder="Search"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          <Ionicons name="mic" size={20}/>
        </View>


        {/* Filters */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterChip,
                  activeFilter === filter && styles.activeChip,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.activeText,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recents */}
        <Text style={styles.sectionTitle}>Recents</Text>
        {RECENTS.map((item) => (
          <View key={item.id} style={styles.recentItem}>
            <Ionicons name="location-outline" size={18} color="#777" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.placeName}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity>
          <Text style={styles.viewMore}>View more</Text>
        </TouchableOpacity>

        {/* Nearby Results */}
        <Text style={styles.sectionTitle}>Nearby {activeFilter}</Text>
        <FlatList
          data={NEARBY}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.poiItem}>
              <View>
                <Text style={styles.placeName}>{item.name}</Text>
                <Text style={styles.address}>
                  {item.floor} · {item.distance}
                </Text>
              </View>

              <TouchableOpacity style={styles.directionsButton}>
                <Ionicons name="navigate" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </Modal>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  filtersWrapper: {
    marginVertical: 12,
  },

  filters: {
    flexDirection: "row",
    paddingHorizontal: 4, 
  },

  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#eee",
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: BURGUNDY,
  },
  filterText: {
    color: "#555",
  },
  activeText: {
    color: "#fff",
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  placeName: {
    fontWeight: "500",
  },
  address: {
    fontSize: 12,
    color: "#777",
  },
  viewMore: {
    color: BURGUNDY,
    marginTop: 4,
    alignSelf: "center",
  },
  poiItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  directionsButton: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 20,
  },

   backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: BURGUNDY,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  closeText: {
    color: BURGUNDY,
    fontWeight: "600",
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    fontSize: 15,
  },
  resultsArea: {
    flex: 1,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  hint: {
    color: "#999",
    marginTop: 8,
  },

  searchContainer: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    // Shadow
    shadowColor: "#000",
    shadowOpacity: 0.3,
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
