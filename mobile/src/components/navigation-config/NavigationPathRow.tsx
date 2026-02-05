import {StyleSheet, Text, View} from "react-native";
import NavigationGoButton from "./NavigationGoButton";
import React from "react";

interface NavigationPathRowProps {
    handleGo: () => void;
}

export default function NavigationPathRow({handleGo}: NavigationPathRowProps) {
    return (
        <View style={styles.actionRow}>
            <View style={styles.statsContainer}>
                <Text style={styles.arrivingLabel}>Arriving in</Text>
                <Text style={styles.arrivingTime}>5 mins</Text>
            </View>

            <View style={styles.statsContainer}>
                <Text style={styles.etaLabel}>ETA</Text>
                <Text style={styles.etaTime}>16:37</Text>
            </View>

            <NavigationGoButton onPress={handleGo}/>
        </View>
    );
}

const styles = StyleSheet.create({
    actionRow: {
        flexDirection: "row",
        width: "95%",
        height: "57%",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 3,
        borderColor: "#D9D9D9",
        borderWidth: 1
    },
    statsContainer: {
        alignItems: "center",
        justifyContent: "center"
    },
    arrivingLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 2,
    },
    arrivingTime: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    },
    etaLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 2,
    },
    etaTime: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    }
});