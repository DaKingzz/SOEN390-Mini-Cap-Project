import React from 'react';
import {StyleSheet, Text, View} from "react-native";

interface ShuttleInfoPageProps{

}

export default function ShuttleInfoPageProps(props: ShuttleInfoPageProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Shuttle</Text>
            <Text>Empty for now</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
});