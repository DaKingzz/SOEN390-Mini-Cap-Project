import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, View, Alert} from "react-native";
import {useNavigation, useRouter} from "expo-router";
import MapView, {Marker, Polygon, PROVIDER_GOOGLE, Region} from "react-native-maps";
import * as Location from 'expo-location';
import SearchBar from "../../components/SearchBar";
import SearchPanel from "../../components/SearchPanel";
import FloatingActionButton from "../../components/FloatingActionButton";
import CampusSwitcher from "../../components/CampusSwitcher";
import {Building, BuildingId, BUILDINGS} from "../../data/buildings";
import BuildingMarker from "../../components/BuildingMarker";
import BuildingPopup from "../../components/BuildingPopup";
import useNavigationState from "../../hooks/useNavigationState";
import {NAVIGATION_STATE} from "../../const";
import NavigationConfigView from "../../components/navigation-config/NavigationConfigView";
import {styles as navStyles} from "../../components/BottomNav";
import useEndpoints from "../../hooks/usePath";
import DirectionPath from "../../components/DirectionPath";

const SGW_CENTER = {latitude: 45.4973, longitude: -73.5790};
const LOYOLA_CENTER = {latitude: 45.4582, longitude: -73.6405};
const CAMPUS_REGION_DELTA = {latitudeDelta: 0.01, longitudeDelta: 0.01};
const BURGUNDY = "#800020";
// When user zooms out more than this, we leave outline mode
const OUTLINE_EXIT_LAT_DELTA = 0.006;
// Zoom level when entering outline mode
const OUTLINE_ENTER_REGION: Pick<Region, "latitudeDelta" | "longitudeDelta"> = {
    latitudeDelta: 0.0028,
    longitudeDelta: 0.0028,
};
// Delay before freezing custom marker rendering for performance
const FREEZE_MARKERS_AFTER_MS = 800;

interface HomePageIndexProps {
}

export default function HomePageIndex(props: HomePageIndexProps) {
    const router = useRouter();
    const [campus, setCampus] = useState<"SGW" | "LOYOLA">("SGW");
    const {setNavigationState, isNavigating, isConfiguring, isSearching} = useNavigationState();
    const {origin, setOrigin, destination, setDestination} = useEndpoints();
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
    const navigation = useNavigation();
    const [region, setRegion] = useState<Region>({
        latitude: SGW_CENTER.latitude,
        longitude: SGW_CENTER.longitude,
        ...CAMPUS_REGION_DELTA,
    });

    const [selectedBuildingId, setSelectedBuildingId] = useState<BuildingId | null>(null);
    const [outlineMode, setOutlineMode] = useState(false);
    const [showBuildingPopup, setShowBuildingPopup] = useState(false);

    // Turns out we gotta freeze custom markers after initial render so it doesnt consume cpu and battery
    const [freezeMarkers, setFreezeMarkers] = useState(false);

    const mapRef = useRef<MapView>(null);
    const locationSubRef = useRef<Location.LocationSubscription | null>(null);

    // Check permission status on mount
    useEffect(() => {
        checkLocationPermission();
    }, []);

    useEffect(() => {
        // When showing the map, let markers render, then freeze them
        setFreezeMarkers(false);
        const t = setTimeout(() => setFreezeMarkers(true), FREEZE_MARKERS_AFTER_MS);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        // Define when the tab bar should be hidden
        const shouldHideTabBar = isConfiguring || isNavigating;

        navigation.setOptions({
            tabBarStyle: shouldHideTabBar
                ? {display: "none"} // Hide it completely
                : navStyles.tabBarStyle, // Explicitly restore your custom styles
        });
    }, [isConfiguring, isNavigating, navigation]);

    const checkLocationPermission = async () => {
        const {status} = await Location.getForegroundPermissionsAsync();
        const granted = status === "granted";
        setHasLocationPermission(granted);

        // If no permission yet, show the enable location screen
        if (!granted) {
            router.push("/(home-page)/enable-location");
        } else {
            // If we have permission, start watching location
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
                () => {
                }
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

    const onPressFab = async () => {
        try {
            if (hasLocationPermission === true) {
                const r = await getOneFix();
                animateToRegion(r);
                return;
            }
            // Navigate to enable location screen
            router.push("/(home-page)/enable-location");
        } catch {
            Alert.alert("Location error", "Could not center the map.");
        }
    };

    const onChangeCampus = (next: "SGW" | "LOYOLA") => {
        setCampus(next);
        const target = next === "SGW" ? SGW_CENTER : LOYOLA_CENTER;
        animateToRegion({
            latitude: target.latitude,
            longitude: target.longitude,
            ...CAMPUS_REGION_DELTA,
        });

        // Leaving building focus mode when switching campus
        setSelectedBuildingId(null);
        setOutlineMode(false);
        setShowBuildingPopup(false);
        setNavigationState(NAVIGATION_STATE.IDLE);
    };

    const selectedBuilding: Building | null =
        selectedBuildingId ? BUILDINGS.find((b) => b.id === selectedBuildingId) ?? null : null;

    const enterOutlineForBuilding = (b: Building) => {
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
            >
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
                    name={selectedBuilding.name}
                    addressLines={selectedBuilding.addressLines}
                    onClose={() => setShowBuildingPopup(false)}
                    onDirections={() => onPressDirections()}
                />
            )}

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
    root: {flex: 1, backgroundColor: "#fff"},

    searchWrapper: {position: "absolute", top: 50, left: 16, right: 16},

    campusWrapper: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 90,
        alignItems: "center",
    },
});