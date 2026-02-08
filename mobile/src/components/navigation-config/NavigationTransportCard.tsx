import React from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {TransportMode} from "../../type";

const BURGUNDY = "#800020";
const OFF_WHITE = "#F5F5F5";

interface NavigationTransportCardProps {
    mode: TransportMode;
    duration: string; // e.g. "5 mins" or "N/A"
    isSelected: boolean;
    onSelect: () => void;
}

export default function NavigationTransportCard({ mode, duration, isSelected, onSelect }: NavigationTransportCardProps) {
    // Mapping mode to icon names
    const getIcon = () => {
        switch (mode) {
            case "WALK": return "walk";
            case "BIKE": return "bicycle";
            case "BUS": return "bus";
            case "SHUTTLE": return "bus-outline"; // Distinct icon for shuttle
        }
    };

    const getLabel = () => {
        switch (mode) {
            case "WALK": return "Walk";
            case "BIKE": return "Bike";
            case "BUS": return "Bus";
            case "SHUTTLE": return "Shuttle";
        }
    };

    return (
        <Pressable
            onPress={onSelect}
            style={[
                styles.card,
                isSelected ? styles.cardSelected : styles.cardUnselected
            ]}
        >
            <Ionicons
                name={getIcon()}
                size={24}
                color={isSelected ? "#FFF" : "#333"}
            />
            <Text style={[styles.label, isSelected && styles.textSelected]}>
                {getLabel()}
            </Text>
            <Text style={[styles.duration, isSelected && styles.textSelected]}>
                {duration}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "19.5%",
        height: "82.5%",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 6,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardUnselected: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    cardSelected: {
        backgroundColor: BURGUNDY,
        borderColor: BURGUNDY,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
        color: "#333",
    },
    duration: {
        fontSize: 10,
        color: "#666",
    },
    textSelected: {
        color: "#FFF",
    },
});