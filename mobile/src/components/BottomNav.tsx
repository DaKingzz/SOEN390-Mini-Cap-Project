import React from "react";
import {StyleSheet, View, Pressable} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Tabs} from "expo-router";

const BURGUNDY = "#800020";
const TABS = [
    {
        name: 'settings',
        title: 'Settings',
        iconFocused: 'settings',
        iconOutline: 'settings-outline',
    },
    {
        name: 'map',
        title: 'Map',
        iconFocused: 'location',
        iconOutline: 'location-outline',
    },
    {
        name: 'shuttle',
        title: 'Shuttle',
        iconFocused: 'bus',
        iconOutline: 'bus-outline',
    }
] as const;

const styles = StyleSheet.create({
        tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 78,
            paddingBottom: 18,
            paddingTop: 10,
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            shadowColor: '#000',
            shadowOpacity: 0.10,
            shadowRadius: 12,
            shadowOffset: {width: 0, height: -4},
            elevation: 10,
            borderTopWidth: 0, // Remove default border
        },
        tabBarItemStyle: {
            width: 52,
            alignItems: 'center',
            justifyContent: 'center',
        },
    }
);

export default function BottomNav() {
    return (
        <Tabs
            screenOptions={{
                ...styles,
                tabBarActiveTintColor: BURGUNDY,
                tabBarInactiveTintColor: BURGUNDY,
                tabBarShowLabel: false,
            }}
        >
            {TABS.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({focused}) => (
                            <Ionicons
                                name={focused ? tab.iconFocused : tab.iconOutline}
                                color={BURGUNDY}
                                size={22}
                            />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
}

