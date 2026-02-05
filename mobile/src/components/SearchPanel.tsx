import React, { useState, useEffect, useRef } from "react";
import { View,Text, TextInput, FlatList,TouchableOpacity,StyleSheet,Pressable,Modal, ScrollView, ActivityIndicator} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { getNearbyPlaces } from "../api";

const BURGUNDY = "#800020";

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

const PLACE_TYPES = [
  { label: "Restaurants", value: "restaurant" },
  { label: "Parking", value: "parking" },
  { label: "Libraries", value: "library" },
  { label: "Parks", value: "park" },
  { label: "Food Stores", value: "food_store" },
  { label: "Banks", value: "bank" },
  { label: "Gyms", value: "gym" },
  { label: "Subway", value: "subway_station" },
  
];



async function getUserLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Location denied");

  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}


export default function SearchPanel({visible, onClose,}: {visible: boolean; onClose: () => void;}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("restaurant");
  const inputRef = useRef<TextInput>(null);
  const [nearby, setNearby] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Record<string, any[]>>({});


  async function fetchNearbyPlaces(placeType: string) {
  if (cacheRef.current[placeType]) {
    setNearby(cacheRef.current[placeType]);
    return;
  }

  setLoading(true);
  try {
    const { latitude, longitude } = await getUserLocation();
    const results = await getNearbyPlaces(latitude, longitude, placeType);
    setNearby(results);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
}


   useEffect(() => {
    if (visible) {
      setQuery("");
      // focus after modal opens
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [visible]);

    useEffect(() => {
      setNearby([]); 
      fetchNearbyPlaces(activeFilter);
  }, [activeFilter]);


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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {PLACE_TYPES.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setActiveFilter(item.value)}
                style={[
                  styles.filterChip,
                  activeFilter === item.value && styles.activeChip,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === item.value && styles.activeText,
                  ]}
                >
                  {item.label}
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
        <View style={{ flex: 1 }}>
          <FlatList
            data={nearby}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.poiItem}>
                <View style={styles.poiTextContainer}>
                  <Text
                    style={styles.placeName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={styles.address}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.address}
                  </Text>
                </View>

                <TouchableOpacity style={styles.directionsButton}>
                  <Ionicons name="navigate" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          />

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={BURGUNDY} />
            </View>
          )}
        </View>

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
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  poiTextContainer: {
    flex: 1,              
    marginRight: 12, 
    paddingTop: 2,     
  },
  directionsButton: {
    flexShrink: 0,       
    backgroundColor: BURGUNDY,
    padding: 10,
    borderRadius: 20,
    alignSelf: "center"
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
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
