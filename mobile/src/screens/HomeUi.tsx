import React, { useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";

import SearchBar from "../components/SearchBar";
import CampusSwitcher from "../components/CampusSwitcher";
import BottomNav from "../components/BottomNav";
import FloatingActionButton from "../components/FloatingActionButton";
import SearchPanel from "../components/SearchPanel";

import SettingsScreen from "./SettingsScreen";
import ShuttleScreen from "./ShuttleScreen";
import EnableLocationScreen from "./EnableLocationScreen";

type Tab = "settings" | "map" | "shuttle";

// Campus center points
const SGW_CENTER = { latitude: 45.4973, longitude: -73.5790 };    // Concordia SGW
const LOYOLA_CENTER = { latitude: 45.4582, longitude: -73.6405 }; // Concordia Loyola

// How close the camera center must be to a campus center for auto-switch to happen
// Around 0.9km. Increase/decrease as need be, imo its fine
const AUTO_SWITCH_RADIUS_METERS = 900;

// Region delta when jumping between campuses (controls zoom level), for the toggle switcher
const CAMPUS_REGION_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export default function HomeUi() {
  const [campus, setCampus] = useState<"SGW" | "LOYOLA">("SGW");
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [searchOpen, setSearchOpen] = useState(false);

  const [showEnableLocation, setShowEnableLocation] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  const [region, setRegion] = useState<Region>({
    latitude: SGW_CENTER.latitude,
    longitude: SGW_CENTER.longitude,
    ...CAMPUS_REGION_DELTA,
  });

  const mapRef = useRef<MapView>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  // Guard to prevent campus auto-switch
  const isProgrammaticMoveRef = useRef(false);

  const stopWatchingLocation = () => {
    locationSubRef.current?.remove();
    locationSubRef.current = null;
  };

  const startWatchingLocation = async () => {
    if (locationSubRef.current) return;

    locationSubRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (loc) => {
        const updated: Region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          ...CAMPUS_REGION_DELTA,
        };
        setRegion(updated);
      }
    );
  };

  const centerToRegion = (r: Region) => {
    setRegion(r);
    mapRef.current?.animateToRegion(r, 600);
  };

  const getOneFix = async (): Promise<Region> => {
    const current = await Location.getCurrentPositionAsync({});
    return {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      ...CAMPUS_REGION_DELTA,
    };
  };

  const requestPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === "granted";
    setHasLocationPermission(granted);
    return granted;
  };

  // Distance helper (meters)
  const metersBetween = (
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ) => {
    // Haversine (good enough)
    const R = 6371000;
    const toRad = (x: number) => (x * Math.PI) / 180;

    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);

    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);

    const h =
      sinDLat * sinDLat +
      Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;

    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const inferCampusFromRegion = (r: Region): "SGW" | "LOYOLA" | null => {
    const center = { latitude: r.latitude, longitude: r.longitude };

    const dSgw = metersBetween(center, SGW_CENTER);
    const dLoy = metersBetween(center, LOYOLA_CENTER);

    // If we’re not close to either campus center, don’t wanna auto-switch
    const nearest = dSgw < dLoy ? "SGW" : "LOYOLA";
    const nearestDist = Math.min(dSgw, dLoy);

    if (nearestDist <= AUTO_SWITCH_RADIUS_METERS) return nearest;
    return null;
  };

  // User tapped "Enable Location"
  const onEnableLocation = async () => {
    try {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert("Permission denied", "You can enable location later in device settings.");
        return;
      }

      setShowEnableLocation(false);

      const r = await getOneFix();
      centerToRegion(r);

      await startWatchingLocation();
    } catch {
      Alert.alert("Location error", "Could not retrieve your location.");
    }
  };

  // User tapped "Skip for now"
  const onSkipLocation = () => {
    setShowEnableLocation(false);
    setHasLocationPermission(false);
    stopWatchingLocation();
  };

  // FAB centers map to user
  const onPressFab = async () => {
    try {
      if (hasLocationPermission === true) {
        // Center to last known region (which we keep updated)
        mapRef.current?.animateToRegion(region, 600);
        return;
      }
      // No permission -> show enable screen again
      setShowEnableLocation(true);
    } catch {
      Alert.alert("Location error", "Could not center the map.");
    }
  };

  // Campus toggle -> animate map to campus center
  const onChangeCampus = (next: "SGW" | "LOYOLA") => {
    setCampus(next);

    const targetCenter = next === "SGW" ? SGW_CENTER : LOYOLA_CENTER;
    const targetRegion: Region = {
      latitude: targetCenter.latitude,
      longitude: targetCenter.longitude,
      ...CAMPUS_REGION_DELTA,
    };

    // Prevent auto-switch from fighting this movement
    isProgrammaticMoveRef.current = true;
    centerToRegion(targetRegion);

    // Release guard shortly after animation ends
    setTimeout(() => {
      isProgrammaticMoveRef.current = false;
    }, 800);
  };

  const renderMapPage = () => {
    if (showEnableLocation) {
      return <EnableLocationScreen onEnable={onEnableLocation} onSkip={onSkipLocation} />;
    }

    return (
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={hasLocationPermission === true}
        showsMyLocationButton={false}
        onRegionChangeComplete={(r) => {
          // Keep region state synced
          setRegion(r);

          // If user moved the camera manually and is near a campus, auto-update the toggle
          if (isProgrammaticMoveRef.current) return;

          const inferred = inferCampusFromRegion(r);
          if (inferred && inferred !== campus) {
            setCampus(inferred);
          }
        }}
      />
    );
  };

  const renderContent = () => {
    if (activeTab === "settings") return <SettingsScreen />;
    if (activeTab === "shuttle") return <ShuttleScreen />;
    return renderMapPage();
  };

  return (
    <View style={styles.root}>
      {renderContent()}

      {/* Overlays only on map tab AND only when the map is visible */}
      {activeTab === "map" && !showEnableLocation && (
        <>
          <View style={styles.searchWrapper}>
            <SearchBar placeholder="Search" onPress={() => setSearchOpen(true)} />
          </View>

          <SearchPanel visible={searchOpen} onClose={() => setSearchOpen(false)} />

          <FloatingActionButton onPress={onPressFab} />

          <View style={styles.campusWrapper}>
            <CampusSwitcher value={campus} onChange={onChangeCampus} />
          </View>
        </>
      )}

      <BottomNav value={activeTab} onChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  searchWrapper: { position: "absolute", top: 50, left: 16, right: 16 },

  campusWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 90,
    alignItems: "center",
  },
});
