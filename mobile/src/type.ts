import {NAVIGATION_STATE} from "./const";

export type NavigationState = typeof NAVIGATION_STATE[keyof typeof NAVIGATION_STATE];
export type TransportMode = "WALK" | "BIKE" | "BUS" | "SHUTTLE";
export type Coordinate = {latitude: number, longitude: number};