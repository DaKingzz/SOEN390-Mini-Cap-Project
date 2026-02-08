import MapViewDirections from 'react-native-maps-directions';
import {Coordinate} from "../type";
import {GOOGLE_MAPS_APIKEY} from "../const";
import useNavigationConfig from "../hooks/useNavigationConfig";
import {useMemo} from "react";
import useNavigationInfo from "../hooks/useNavigationInfo";

interface DirectionPathProps {
    origin: Coordinate
    destination: Coordinate
}

export default function DirectionPath({origin, destination}: DirectionPathProps) {
    const {navigationMode} = useNavigationConfig();
    const {setPathDistance, setPathDuration} = useNavigationInfo();
    const directionsMode = useMemo(() => {
        switch (navigationMode) {
            case "BUS":
                return "TRANSIT";
            case "WALK":
                return "WALKING";
            case "BIKE":
                return "BICYCLING";
            case "SHUTTLE":
                return "TRANSIT";
            default:
                return "DRIVING";
        }
    }, [navigationMode]);

    return (
        <MapViewDirections
            origin={origin}
            destination={destination}
            mode={directionsMode}
            strokeWidth={3}
            strokeColor="red"
            onReady={result => {
                setPathDistance(result.distance);
                setPathDuration(result.duration);
            }}
            apikey={GOOGLE_MAPS_APIKEY}
        />
    );
}
