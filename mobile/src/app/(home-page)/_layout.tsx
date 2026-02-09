import { Stack } from "expo-router";

export default function HomePageLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerBackButtonMenuEnabled: false,
            }}
        />
    );
}