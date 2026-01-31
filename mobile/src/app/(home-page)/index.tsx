import React, {useState} from 'react';
import {StyleSheet, Text, View} from "react-native";
import SearchBar from "../../components/SearchBar";
import SearchPanel from "../../components/SearchPanel";
import FloatingActionButton from "../../components/FloatingActionButton";
import CampusSwitcher from "../../components/CampusSwitcher";

interface HomePageIndexProps {

}

export default function HomePageIndex(props: HomePageIndexProps) {
    const [campus, setCampus] = useState<"SGW" | "LOYOLA">("SGW");
    const [searchOpen, setSearchOpen] = useState(false);

    const renderContent = () => {
        return (
            <View style={styles.mapPlaceholder}>
                <Text style={styles.placeholderText}>Map goes here (later)</Text>
            </View>
        );
    };

    return (
        <View style={styles.root}>
            {/* Always render the active page content */}
            {<View style={styles.mapPlaceholder}>
                <Text style={styles.placeholderText}>Map goes here (later)</Text>
            </View>
            }

            {/* Only show these overlays on the "map" tab */}
            <>
                <View style={styles.searchWrapper}>
                    <SearchBar placeholder="Search" onPress={() => setSearchOpen(true)}/>
                </View>

                <SearchPanel visible={searchOpen} onClose={() => setSearchOpen(false)}/>

                <FloatingActionButton onPress={() => {
                }}/>

                <View style={styles.campusWrapper}>
                    <CampusSwitcher value={campus} onChange={setCampus}/>
                </View>
            </>

            {/* Always show Bottom Nav */}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {flex: 1, backgroundColor: "#fff"},

    mapPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#EAEAEA",
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderText: {fontSize: 16, opacity: 0.6},

    searchWrapper: {position: "absolute", top: 50, left: 16, right: 16},

    campusWrapper: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 90,
        alignItems: "center",
    },
});