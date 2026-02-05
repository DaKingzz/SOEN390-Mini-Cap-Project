import React, {useState} from "react";
import {StyleSheet, View, Text} from "react-native";
import BottomDrawer from "../BottomDrawer";
import NavigationTransportCard, {TransportMode} from "./NavigationTransportCard";
import NavigationGoButton from "./NavigationGoButton";
import NavigationPathRow from "./NavigationPathRow";

interface NavigationConfigViewProps {
    visible: boolean;
    onClose: () => void;
}

export default function NavigationConfigView({visible, onClose}: NavigationConfigViewProps) {
    const [selectedMode, setSelectedMode] = useState<TransportMode>("WALK");

    const handleGo = () => {
        // Logic to start the actual turn-by-turn navigation
        console.log("Start navigation with mode:", selectedMode);
    };

    return (
        <BottomDrawer
            visible={visible}
            onClose={onClose}
            snapPoints={['35%']} // Adjusted height for this content
            enablePanDownToClose={true}
            contentContainerStyle={styles.drawerContent}
        >
            {/* 1. Transport Mode Selection Row */}
            <View style={styles.transportRow}>
                <NavigationTransportCard
                    mode="WALK"
                    duration="5 mins"
                    isSelected={selectedMode === "WALK"}
                    onSelect={() => setSelectedMode("WALK")}
                />
                <NavigationTransportCard
                    mode="BIKE"
                    duration="5 mins"
                    isSelected={selectedMode === "BIKE"}
                    onSelect={() => setSelectedMode("BIKE")}
                />
                <NavigationTransportCard
                    mode="BUS"
                    duration="N/A"
                    isSelected={selectedMode === "BUS"}
                    onSelect={() => setSelectedMode("BUS")}
                />
                <NavigationTransportCard
                    mode="SHUTTLE"
                    duration="N/A"
                    isSelected={selectedMode === "SHUTTLE"}
                    onSelect={() => setSelectedMode("SHUTTLE")}
                />
            </View>

            {/* 2. Stats & Action Row */}
            <NavigationPathRow handleGo={handleGo}/>
        </BottomDrawer>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        alignItems: "center",
        backgroundColor: ""
    },
    transportRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "95%",
        paddingHorizontal: 5,
        marginBottom: 20,
        borderRadius: 5,
        backgroundColor: "#D9D9D9",
    }
});