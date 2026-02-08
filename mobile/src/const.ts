import Constants from "expo-constants";

export const NAVIGATION_STATE = {
    IDLE: 'IDLE',
    SEARCHING: 'SEARCHING',
    ROUTE_CONFIGURING: 'ROUTE_CONFIGURING',
    NAVIGATING: 'NAVIGATING'
} as const;
export const GOOGLE_MAPS_APIKEY = Constants.expoConfig?.extra?.googleMapsApiKey;