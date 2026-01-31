import React from 'react';
import {StyleSheet, Text, View} from "react-native";

interface SettingsIndexPageProps{}

export default function SettingsIndexPageProps(props: SettingsIndexPageProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <Text>Empty for now</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff"},
    title: {fontSize: 20, fontWeight: "600", marginBottom: 8},
});
