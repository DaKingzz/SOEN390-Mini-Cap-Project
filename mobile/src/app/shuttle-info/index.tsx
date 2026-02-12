import { useState, useMemo, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CampusSwitcher from "../../components/CampusSwitcher";
import { computeNextDepartures } from "../../data/ShuttleSchedule";
import { getSchedule, DeparturesByDay } from "../../services/shuttleScheduleCache";

type Campus = "SGW" | "LOYOLA";
type CampusKey = "sgw" | "loyola";

const CAMPUS_INFO = {
    SGW: {
        name: "Henry F. Hall",
        address: "1455 Blvd. De Maisonneuve Ouest",
    },
    LOYOLA: {
        name: "Loyola Chapel",
        address: "7141 Sherbrooke St. W.",
    },
} as const;

const BURGUNDY = "#800020";

export default function ShuttleInfoPage() {
    const router = useRouter();
    const [campus, setCampus] = useState<Campus>("SGW");
    const [showFullSchedule, setShowFullSchedule] = useState(false);
    const [schedule, setSchedule] = useState<DeparturesByDay | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        getSchedule()
            .then(setSchedule)
            .catch(() => setError(true));
    }, []);

    const campusInfo = CAMPUS_INFO[campus];
    const campusKey: CampusKey = campus === "SGW" ? "sgw" : "loyola";

    // Navigate to map with shuttle campus parameter
    const onDirectionsPress = () => {
        router.push({
            pathname: "/(home-page)",
            params: { shuttleCampus: campus }
        });
    };

    const nextDepartures = useMemo(() => {
        if (!schedule) return [];
        return computeNextDepartures(
            campusKey,
            campusInfo.name,
            schedule.monThu,
            schedule.friday
        );
    }, [campusKey, campusInfo.name, schedule]);

    const monThuTimes = schedule?.monThu[campusKey] ?? [];
    const fridayTimes = schedule?.friday[campusKey] ?? [];

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>
                    Unable to load shuttle schedule. Please try again later.
                </Text>
            </View>
        );
    }

    if (!schedule) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={BURGUNDY} />
                <Text style={styles.loadingText}>Loading shuttle schedule…</Text>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <ScrollView
                contentContainerStyle={styles.content}
                style={{ flex: 1 }}
            >
                {showFullSchedule && (
                    <Pressable
                        style={styles.backBtn}
                        onPress={() => setShowFullSchedule(false)}
                        hitSlop={10}
                    >
                        <Ionicons name="arrow-back" size={22} color={BURGUNDY} />
                    </Pressable>
                )}

                <Text style={styles.title}>Shuttle Schedule</Text>

                <View style={styles.locationRow}>
                    <Text style={styles.locationLabel}>
                        {campus === "SGW" ? "S.G.W Departures" : "Loyola Departures"}
                    </Text>
                    <View style={styles.locationLine}>
                        <Text style={styles.locationText}>{campusInfo.address}</Text>
                        <Pressable
                            style={styles.directionsBtn}
                            onPress={onDirectionsPress}
                            hitSlop={10}
                        >
                            <Ionicons name="navigate" size={18} color="#fff" />
                        </Pressable>
                    </View>
                </View>

                {showFullSchedule ? (
                    <FullScheduleTable monThu={monThuTimes} fri={fridayTimes} />
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Next Departures</Text>

                        {nextDepartures.length === 0 ? (
                            <Text style={{ color: "#666" }}>No more departures today.</Text>
                        ) : (
                            <View style={styles.list}>
                                {nextDepartures.map((d) => (
                                    <DepartureCard
                                        key={d.id}
                                        time={d.time}
                                        from={d.from}
                                        eta={d.eta}
                                        countdownMin={d.countdownMin}
                                    />
                                ))}
                            </View>
                        )}

                        <View style={styles.divider} />

                        <Pressable
                            style={styles.fullButton}
                            onPress={() => setShowFullSchedule(true)}
                        >
                            <Text style={styles.fullButtonText}>View Full Schedule</Text>
                        </Pressable>
                    </>
                )}
            </ScrollView>

            <View style={styles.campusWrapper}>
                <CampusSwitcher value={campus} onChange={setCampus} />
            </View>
        </View>
    );
}

function DepartureCard({
                           time,
                           from,
                           eta,
                           countdownMin,
                       }: {
    time: string;
    from: string;
    eta: string;
    countdownMin: number;
}) {
    return (
        <Pressable
            style={styles.card}
            onPress={() => {
                /* TODO: open route/directions */
            }}
        >
            <View style={styles.cardLeft}>
                <Text style={styles.cardTime}>{time}</Text>
                <Text style={styles.cardFrom}>from {from}</Text>
                <Text style={styles.cardEta}>{eta}</Text>
            </View>

            <View style={styles.badge}>
                <Text style={styles.badgeText}>{countdownMin}min</Text>
            </View>
        </Pressable>
    );
}

function FullScheduleTable({
                               monThu,
                               fri,
                           }: {
    monThu: string[];
    fri: string[];
}) {
    const rows = Math.max(monThu.length, fri.length);

    return (
        <View style={styles.table}>
            <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Monday - Thursday</Text>
                <Text style={styles.tableHeaderText}>Friday</Text>
            </View>

            {Array.from({ length: rows }).map((_, i) => {
                const zebra = i % 2 === 0;
                return (
                    <View
                        key={i}
                        style={[styles.tableRow, zebra ? styles.rowLight : styles.rowDark]}
                    >
                        <Text style={styles.cellText}>{monThu[i] ?? ""}</Text>
                        <Text style={styles.cellText}>{fri[i] ?? ""}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#fff" },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: 24,
    },
    loadingText: { marginTop: 12, fontSize: 14, color: "#666" },
    errorText: { fontSize: 16, color: "#c00", textAlign: "center" },

    content: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 220,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        marginTop: 6,
        marginBottom: 10,
    },
    locationRow: {
        marginBottom: 16,
    },
    locationLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#333",
        marginBottom: 4,
    },
    locationLine: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    locationText: {
        fontSize: 14,
        color: "#333",
        flex: 1,
        paddingRight: 8,
    },
    directionsBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: BURGUNDY,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 10,
    },
    list: { gap: 10 },
    card: {
        backgroundColor: BURGUNDY,
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardLeft: {
        flex: 1,
        paddingRight: 10,
    },
    cardTime: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "900",
        marginBottom: 4,
    },
    cardFrom: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 2,
    },
    cardEta: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    badge: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        minWidth: 60,
        alignItems: "center",
    },
    badgeText: {
        color: "#111",
        fontWeight: "800",
    },
    fullButton: {
        marginTop: 18,
        borderWidth: 1.5,
        borderColor: BURGUNDY,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: "center",
    },
    fullButtonText: {
        color: BURGUNDY,
        fontWeight: "800",
        fontSize: 16,
    },
    campusWrapper: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 90,
        alignItems: "center",
    },
    divider: {
        height: 2,
        backgroundColor: "#E6E6E6",
        marginTop: 26,
        marginBottom: 26,
    },
    backBtn: {
        alignSelf: "flex-start",
        marginTop: 4,
        marginBottom: 6,
    },
    table: {
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E6E6E6",
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: BURGUNDY,
    },
    tableHeaderText: {
        flex: 1,
        color: "#fff",
        fontWeight: "800",
        paddingVertical: 12,
        textAlign: "center",
    },
    tableRow: {
        flexDirection: "row",
    },
    rowLight: {
        backgroundColor: "#F4F4F4",
    },
    rowDark: {
        backgroundColor: "#E9E9E9",
    },
    cellText: {
        flex: 1,
        paddingVertical: 14,
        textAlign: "center",
        fontWeight: "700",
        color: "#111",
    },
});