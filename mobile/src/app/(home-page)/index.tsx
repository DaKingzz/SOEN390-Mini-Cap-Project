import React, {useEffect, useRef, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from "react-native";
import {useNavigation, useLocalSearchParams} from "expo-router";
import MapView, {Marker, Polygon, PROVIDER_GOOGLE, Region} from "react-native-maps";
import * as Location from 'expo-location';
import SearchBar from "../../components/SearchBar";
import SearchPanel from "../../components/SearchPanel";
import FloatingActionButton from "../../components/FloatingActionButton";
import CampusSwitcher from "../../components/CampusSwitcher";
import {Building, BuildingId, BUILDINGS} from "../../data/buildings";
import BuildingMarker from "../../components/BuildingMarker";
import BuildingPopup from "../../components/BuildingPopup";
import UpcomingEventButton from "../../components/UpcomingEventButton";
import useNavigationState from "../../hooks/useNavigationState";
import {NAVIGATION_STATE} from "../../const";
import NavigationConfigView from "../../components/navigation-config/NavigationConfigView";
import {styles as navStyles} from "../../components/BottomNav";
import useNavigationEndpoints from "../../hooks/useNavigationEndpoints";
import DirectionPath from "../../components/DirectionPath";

const SGW_CENTER = {latitude: 45.4973, longitude: -73.5790};
const LOYOLA_CENTER = {latitude: 45.4582, longitude: -73.6405};
const CAMPUS_REGION_DELTA = {latitudeDelta: 0.01, longitudeDelta: 0.01};

// Shuttle stop coordinates
const SHUTTLE_STOPS = {
    SGW: { latitude: 45.497122, longitude: -73.578471 },
    LOYOLA: { latitude: 45.45844144049705, longitude: -73.63831707854963 },
} as const;

const BURGUNDY = "#800020";
const OUTLINE_EXIT_LAT_DELTA = 0.006;
const OUTLINE_ENTER_REGION: Pick<Region, "latitudeDelta" | "longitudeDelta"> = {
    latitudeDelta: 0.0028,
    longitudeDelta: 0.0028,
};
const FREEZE_MARKERS_AFTER_MS = 800;

interface HomePageIndexProps {
}

export default function HomePageIndex(props: HomePageIndexProps) {
    const navigation = useNavigation();
    const params = useLocalSearchParams<{ shuttleCampus?: string }>();

    const [campus, setCampus] = useState<"SGW" | "LOYOLA">("SGW");
    const {setNavigationState, isNavigating, isConfiguring, isSearching} = useNavigationState();
    const {origin, setOrigin, destination, setDestination} = useNavigationEndpoints();
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
    const [showEnableLocation, setShowEnableLocation] = useState(true);

    const [region, setRegion] = useState<Region>({
        latitude: SGW_CENTER.latitude,
        longitude: SGW_CENTER.longitude,
        ...CAMPUS_REGION_DELTA,
    });

    // Shuttle stop state
    const [shuttleStop, setShuttleStop] = useState<{
        campus: "SGW" | "LOYOLA";
        coordinate: { latitude: number; longitude: number };
    } | null>(null);

    const [selectedBuildingId, setSelectedBuildingId] = useState<BuildingId | null>(null);
    const [outlineMode, setOutlineMode] = useState(false);
    const [showBuildingPopup, setShowBuildingPopup] = useState(false);

    const [mapReady, setMapReady] = useState(false);
    const [freezeMarkers, setFreezeMarkers] = useState(false);
    const freezeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const mapRef = useRef<MapView>(null);
    const locationSubRef = useRef<Location.LocationSubscription | null>(null);

    // Check permission status on mount
    useEffect(() => {
        checkLocationPermission();
    }, []);

    // Handle shuttle navigation from route params
    useEffect(() => {
        if (params.shuttleCampus && (params.shuttleCampus === 'SGW' || params.shuttleCampus === 'LOYOLA')) {
            const targetCampus = params.shuttleCampus as "SGW" | "LOYOLA";
            const coord = SHUTTLE_STOPS[targetCampus];

            setCampus(targetCampus);
            setShuttleStop({ campus: targetCampus, coordinate: coord });

            // Clear any building focus when showing shuttle stop
            setSelectedBuildingId(null);
            setOutlineMode(false);
            setShowBuildingPopup(false);
        }
    }, [params.shuttleCampus]);

    // Animate to shuttle stop when it's set and map is ready
    useEffect(() => {
        if (!shuttleStop) return;
        if (showEnableLocation) return;
        if (!mapReady) return;

        // Let overlays/markers render before camera jump
        requestAnimationFrame(() => {
            animateToRegion({
                latitude: shuttleStop.coordinate.latitude,
                longitude: shuttleStop.coordinate.longitude,
                ...CAMPUS_REGION_DELTA,
            });
        });

        // Unfreeze briefly during camera movement
        scheduleFreezeMarkers();
    }, [shuttleStop, showEnableLocation, mapReady]);

    useEffect(() => {
        scheduleFreezeMarkers();
        return () => {
            if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
            freezeTimerRef.current = null;
        };
    }, [showEnableLocation]);

    useEffect(() => {
        const shouldHideTabBar = isConfiguring || isNavigating;

        navigation.setOptions({
            tabBarStyle: shouldHideTabBar
                ? {display: "none"}
                : navStyles.tabBarStyle,
        });
    }, [isConfiguring, isNavigating, navigation]);

    useEffect(() => {
        scheduleFreezeMarkers();
        return () => {
            if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
            freezeTimerRef.current = null;
        };
    }, [mapReady, showEnableLocation, isConfiguring, isNavigating]);

    const checkLocationPermission = async () => {
        const {status} = await Location.getForegroundPermissionsAsync();
        const granted = status === "granted";
        setHasLocationPermission(granted);
        if (granted) {
            setShowEnableLocation(false);
            await startWatchingLocation();
        }
    };

    const stopWatchingLocation = () => {
        locationSubRef.current?.remove();
        locationSubRef.current = null;
    };

    const startWatchingLocation = async () => {
        if (locationSubRef.current) return;
        try {
            locationSubRef.current = await Location.watchPositionAsync(
                {accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1},
                () => {}
            );
        } catch (error) {
            console.error("Error watching location:", error);
        }
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

    const scheduleFreezeMarkers = () => {
        if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
        setFreezeMarkers(false);

        const overlaysVisible = !showEnableLocation;
        if (!mapReady || !overlaysVisible) return;

        freezeTimerRef.current = setTimeout(() => {
            setFreezeMarkers(true);
        }, FREEZE_MARKERS_AFTER_MS);
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

    const onEnableLocation = async () => {
        try {
            const granted = await Location.requestForegroundPermissionsAsync().then(({status}) => status === "granted");
            if (!granted) {
                Alert.alert("Permission denied", "You can enable location later in device settings.");
                return;
            }
            setHasLocationPermission(true);
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

    const onChangeCampus = (next: "SGW" | "LOYOLA") => {
        setCampus(next);
        const target = next === "SGW" ? SGW_CENTER : LOYOLA_CENTER;

        scheduleFreezeMarkers();
        animateToRegion({
            latitude: target.latitude,
            longitude: target.longitude,
            ...CAMPUS_REGION_DELTA,
        });

        // Clear building focus
        setSelectedBuildingId(null);
        setOutlineMode(false);
        setShowBuildingPopup(false);

        // Clear shuttle stop when manually changing campus
        setShuttleStop(null);

        setNavigationState(NAVIGATION_STATE.IDLE);
    };

    const selectedBuilding: Building | null =
        selectedBuildingId ? BUILDINGS.find((b) => b.id === selectedBuildingId) ?? null : null;

    const enterOutlineForBuilding = (b: Building) => {
        scheduleFreezeMarkers();

        // Clear shuttle stop when focusing on a building
        setShuttleStop(null);

        setSelectedBuildingId(b.id);
        setOutlineMode(true);
        setShowBuildingPopup(false);

        animateToRegion({
            latitude: b.marker.latitude,
            longitude: b.marker.longitude,
            ...OUTLINE_ENTER_REGION,
        });
    };

    const onPressBuilding = (b: Building) => {
        if (selectedBuildingId !== b.id || !outlineMode) {
            setDestination({longitude: b.marker.longitude, latitude: b.marker.latitude})
            enterOutlineForBuilding(b);
            return;
        }
        setShowBuildingPopup(true);
    };

    const onPressDirections = async () => {
        setShowBuildingPopup(false);
        const currLocation = await getOneFix();
        setOrigin({longitude: currLocation.longitude, latitude: currLocation.latitude});
        setNavigationState(NAVIGATION_STATE.ROUTE_CONFIGURING);
    }

    const handleRegionChangeComplete = (r: Region) => {
        setRegion(r);

        if (outlineMode && r.latitudeDelta > OUTLINE_EXIT_LAT_DELTA) {
            setOutlineMode(false);
            setShowBuildingPopup(false);
            setSelectedBuildingId(null);
        }
    };

    if (showEnableLocation) {
        return (
            <View style={styles.root}>
                <View style={styles.enableLocationContainer}>
                    <View style={styles.enableLocationIconCircle}>
                        <Text style={styles.enableLocationIcon}>📍</Text>
                    </View>
                    <Text style={styles.enableLocationTitle}>Enable Location Services</Text>
                    <Text style={styles.enableLocationSubtitle}>
                        To help you navigate Concordia's campus, we need access to your location.
                    </Text>
                    <View style={styles.enableLocationBullets}>
                        <Text style={styles.enableLocationBullet}>• Real-time positioning on the map</Text>
                        <Text style={styles.enableLocationBullet}>• Turn-by-turn directions</Text>
                        <Text style={styles.enableLocationBullet}>• Nearby points of interest</Text>
                    </View>
                    <Pressable style={styles.enableLocationBtn} onPress={onEnableLocation}>
                        <Text style={styles.enableLocationBtnText}>Enable Location</Text>
                    </Pressable>
                    <Pressable style={styles.enableLocationSkip} onPress={onSkipLocation}>
                        <Text style={styles.enableLocationSkipText}>Skip for now</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                showsUserLocation={hasLocationPermission === true}
                showsMyLocationButton={false}
                onRegionChangeComplete={handleRegionChangeComplete}
                onPress={() => {
                    setShowBuildingPopup(false);
                    setNavigationState(NAVIGATION_STATE.IDLE);
                }}
                onMapReady={() => {
                    setMapReady(true);
                    scheduleFreezeMarkers();
                }}
            >
                {/* Shuttle stop marker (only when set) */}
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
                        <BuildingMarker label={b.id}/>
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

                {(isConfiguring || isNavigating) && (
                    <DirectionPath origin={origin} destination={destination}/>
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
                    onDirections={() => onPressDirections()}
                />
            )}

            <View
                style={[
                    styles.upcomingEventWrapper,
                    (showEnableLocation || isConfiguring || isNavigating) && styles.overlayHidden,
                ]}
                pointerEvents={!showEnableLocation && !(isConfiguring || isNavigating) ? "auto" : "none"}
            >
                <UpcomingEventButton/>
            </View>

            <View style={styles.searchWrapper}>
                <SearchBar placeholder="Search" onPress={() => setNavigationState(NAVIGATION_STATE.SEARCHING)}/>
            </View>

            <SearchPanel visible={isSearching}
                         onClose={() => setNavigationState(NAVIGATION_STATE.IDLE)}/>
            <NavigationConfigView visible={isConfiguring} onClose={() => setNavigationState(NAVIGATION_STATE.IDLE)}/>

            <FloatingActionButton onPress={onPressFab}/>

            <View style={styles.campusWrapper}>
                <CampusSwitcher value={campus} onChange={onChangeCampus}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#fff" },
    enableLocationContainer: {
        flex: 1,
        paddingTop: 80,
        paddingHorizontal: 24,
    },
    enableLocationIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(128,0,32,0.18)",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 22,
    },
    enableLocationIcon: { fontSize: 40 },
    enableLocationTitle: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
    },
    enableLocationSubtitle: {
        textAlign: "center",
        color: "#666",
        lineHeight: 20,
        marginBottom: 24,
    },
    enableLocationBullets: { gap: 12, marginBottom: 28 },
    enableLocationBullet: { color: "#333", fontWeight: "600" },
    enableLocationBtn: {
        backgroundColor: BURGUNDY,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 10,
    },
    enableLocationBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    enableLocationSkip: { paddingVertical: 14, alignItems: "center" },
    enableLocationSkipText: { color: "#777", fontWeight: "600" },
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