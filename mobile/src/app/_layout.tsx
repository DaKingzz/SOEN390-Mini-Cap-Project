import {Tabs} from "expo-router";

export default function RootLayout() {
    return (
        // Move Bottom Nav Bar Here
        <Tabs>
            <Tabs.Screen name="Settings"/>
            <Tabs.Screen name="Home"/>
            <Tabs.Screen name="Shuttle Info"/>
        </Tabs>
    );
}