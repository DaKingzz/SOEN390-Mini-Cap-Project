import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import MapView, { Polygon, PROVIDER_GOOGLE, Region, Marker } from "react-native-maps";
import * as Location from "expo-location";

import SearchBar from "../components/SearchBar";
import CampusSwitcher from "../components/CampusSwitcher";
import BottomNav from "../components/BottomNav";
import FloatingActionButton from "../components/FloatingActionButton";
import SearchPanel from "../components/SearchPanel";
import UpcomingEventButton from "../components/UpcomingEventButton";

import SettingsScreen from "./SettingsScreen";
import ShuttleScreen from "./ShuttleScreen";
import EnableLocationScreen from "./EnableLocationScreen";

import { BUILDINGS, Building, BuildingId } from "../data/buildings";
import BuildingMarker from "../components/BuildingMarker";
import BuildingPopup from "../components/BuildingPopup";

type Tab = "settings" | "map" | "shuttle";

const SGW_CENTER = { latitude: 45.4973, longitude: -73.5790 };
const LOYOLA_CENTER = { latitude: 45.4582, longitude: -73.6405 };
const CAMPUS_REGION_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };
const SHUTTLE_STOPS = {
  SGW: { latitude: 45.497122, longitude: -73.578471 },
  LOYOLA: { latitude: 45.45844144049705, longitude: -73.63831707854963 },
} as const;


const BURGUNDY = "#800020";

// When user zooms out more than this, we leave outline mode (back to regular map view)
const OUTLINE_EXIT_LAT_DELTA = 0.006;

// Zoom level when entering outline mode (when you click on a marker)
const OUTLINE_ENTER_REGION: Pick<Region, "latitudeDelta" | "longitudeDelta"> = {
  latitudeDelta: 0.0028,
  longitudeDelta: 0.0028,
};

// When Mmap ready then freeze markers
const FREEZE_AFTER_MAP_READY_MS = 1500;

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

  const [shuttleStop, setShuttleStop] = useState<{
  campus: "SGW" | "LOYOLA";
  coordinate: { latitude: number; longitude: number };
} | null>(null);


  const [selectedBuildingId, setSelectedBuildingId] = useState<BuildingId | null>(null);
  const [outlineMode, setOutlineMode] = useState(false);
  const [showBuildingPopup, setShowBuildingPopup] = useState(false);

  // Markers Pptimization Control
  const [mapReady, setMapReady] = useState(false);
  const [freezeMarkers, setFreezeMarkers] = useState(false);
  const freezeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapRef = useRef<MapView>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    // When entering the map screen, let markers render, then freeze them
    // Reset freeze when switching back to map to avoid invisible markers
    if (activeTab === "map" && !showEnableLocation) {
      setFreezeMarkers(false);
      const t = setTimeout(() => setFreezeMarkers(true), FREEZE_MARKERS_AFTER_MS);

      if (shuttleStop) {
      requestAnimationFrame(() => {
        mapRef.current?.animateToRegion(
          {
            latitude: shuttleStop.coordinate.latitude,
            longitude: shuttleStop.coordinate.longitude,
            ...CAMPUS_REGION_DELTA,
          },
          650
        );
      });
    }
      return () => clearTimeout(t);
    }
  }, [activeTab, showEnableLocation, shuttleStop]);

  useEffect(() => {
    if (activeTab !== "map") {
      setShuttleStop(null);
    }
  }, [activeTab]);


  const stopWatchingLocation = () => {
    locationSubRef.current?.remove();
    locationSubRef.current = null;
  };

  const startWatchingLocation = async () => {
    if (locationSubRef.current) return;
    locationSubRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
      () => {}
    );
  };

  const requestPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === "granted";
    setHasLocationPermission(granted);
    return granted;
  };

  const getOneFix = async (): Promise<Region> => {
    const current = await Location.getCurrentPositionAsync({});
    return {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      ...CAMPUS_REGION_DELTA,
    };
  };

  const animateToRegion = (r: Region) => {
    mapRef.current?.animateToRegion(r, 650);
  };

  // Marker Freeze
  const scheduleFreezeMarkers = () => {
    // Clear any previous timer
    if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);

    // Unfreeze first so markers can render
    setFreezeMarkers(false);

    // Only freeze if map is ready and map page is actually visible
    if (!mapReady || activeTab !== "map" || showEnableLocation) return;

    freezeTimerRef.current = setTimeout(() => {
      setFreezeMarkers(true);
    }, FREEZE_AFTER_MAP_READY_MS);
  };

  useEffect(() => {
    // Every time map becomes visible/ready, reschedule freezing safely
    // Meaning freezing properly so markers dont just disappear
    scheduleFreezeMarkers();
    return () => {
      if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
      freezeTimerRef.current = null;
    };
  }, [mapReady, activeTab, showEnableLocation]);

  const onEnableLocation = async () => {
    try {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert("Permission denied", "You can enable location later in device settings.");
        return;
      }

      setShowEnableLocation(false);

      const r = await getOneFix();
      animateToRegion(r);

      await startWatchingLocation();
    } catch {
      Alert.alert("Location error", "Could not retrieve your location.");
    }
  };

  const onSkipLocation = () => {
    setShowEnableLocation(false);
    setHasLocationPermission(false);
    stopWatchingLocation();
  };

  const onPressFab = async () => {
    try {
      if (hasLocationPermission === true) {
        const r = await getOneFix();
        animateToRegion(r);
        return;
      }
      setShowEnableLocation(true);
    } catch {
      Alert.alert("Location error", "Could not center the map.");
    }
  };

  const onChangeCampus = (next: "SGW" | "LOYOLA") => {
    setCampus(next);
    const target = next === "SGW" ? SGW_CENTER : LOYOLA_CENTER;

    // Unfreeze briefly when camera jumps
    scheduleFreezeMarkers();

    animateToRegion({
      latitude: target.latitude,
      longitude: target.longitude,
      ...CAMPUS_REGION_DELTA,
    });

    setSelectedBuildingId(null);
    setOutlineMode(false);
    setShowBuildingPopup(false);
  };

  const selectedBuilding: Building | null =
    selectedBuildingId ? BUILDINGS.find((b) => b.id === selectedBuildingId) ?? null : null;

  const enterOutlineForBuilding = (b: Building) => {
    // Unfreeze briefly when going into outline mode
    scheduleFreezeMarkers();

    setSelectedBuildingId(b.id);
    setOutlineMode(true);
    setShowBuildingPopup(false);

    animateToRegion({
      latitude: b.marker.latitude,
      longitude: b.marker.longitude,
      ...OUTLINE_ENTER_REGION,
    });
  };


  const goToShuttleStop = (c: "SGW" | "LOYOLA") => {
  const coord = SHUTTLE_STOPS[c];

  setCampus(c);
  setShuttleStop({ campus: c, coordinate: coord });
  setActiveTab("map");
};

  const onPressBuilding = (b: Building) => {
    if (selectedBuildingId !== b.id || !outlineMode) {
      enterOutlineForBuilding(b);
      return;
    }
    setShowBuildingPopup(true);
  };

  const handleRegionChangeComplete = (r: Region) => {
    setRegion(r);

    if (outlineMode && r.latitudeDelta > OUTLINE_EXIT_LAT_DELTA) {
      setOutlineMode(false);
      setShowBuildingPopup(false);
      setSelectedBuildingId(null);
    }
  };

  const renderMapPage = () => {
    if (showEnableLocation) {
      return <EnableLocationScreen onEnable={onEnableLocation} onSkip={onSkipLocation} />;
    }

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          showsUserLocation={hasLocationPermission === true}
          showsMyLocationButton={false}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={() => setShowBuildingPopup(false)}
          onMapReady={() => {
            setMapReady(true);
            scheduleFreezeMarkers();
          }}
        >

          {shuttleStop && (
            <Marker
              coordinate={shuttleStop.coordinate}
              title={`${shuttleStop.campus} Shuttle Stop`}
              pinColor={BURGUNDY}
            />
          )}

          {BUILDINGS.map((b) => (
            <Marker
              key={b.id}
              coordinate={b.marker}
              onPress={(e) => {
                e.stopPropagation?.();
                onPressBuilding(b);
              }}
              tracksViewChanges={!freezeMarkers}
            >
              <BuildingMarker label={b.id} />
            </Marker>
          ))}

          {outlineMode && selectedBuilding && (
            <Polygon
              coordinates={selectedBuilding.polygon}
              strokeColor={BURGUNDY}
              strokeWidth={3}
              fillColor="rgba(128,0,32,0.12)"
            />
          )}
        </MapView>

        {showBuildingPopup && selectedBuilding && (
          <BuildingPopup
            id={selectedBuilding.id}
            name={selectedBuilding.name}
            addressLines={selectedBuilding.addressLines}
            openingHours={selectedBuilding.openingHours.label}
            hasStudySpots={selectedBuilding.hasStudySpots}
            image={selectedBuilding.image}
            accessibility={selectedBuilding.accessibility}
            onClose={() => setShowBuildingPopup(false)}
            onDirections={() => {}}
          />
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (activeTab === "settings") return <SettingsScreen />;
    if (activeTab === "shuttle") return <ShuttleScreen onDirections={goToShuttleStop} />;
    return renderMapPage();
  };

  const showMapOverlays = activeTab === "map" && !showEnableLocation;

  return (
    <View style={styles.root}>
      {renderContent()}

      <View
        style={[styles.upcomingEventWrapper, !showMapOverlays && styles.overlayHidden]}
        pointerEvents={showMapOverlays ? "auto" : "none"}
      >
        <UpcomingEventButton />
      </View>

      {showMapOverlays && (
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
  upcomingEventWrapper: { position: "absolute", top: 108, left: 16, right: 16 },
  overlayHidden: { opacity: 0 },
  campusWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 90,
    alignItems: "center",
  },
});
