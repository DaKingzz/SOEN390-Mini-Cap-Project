import MapViewDirections from 'react-native-maps-directions';
import {Coordinate} from "../type";
import {GOOGLE_MAPS_APIKEY} from "../const";

interface DirectionPathProps {
    origin: Coordinate
    destination: Coordinate
}

export default function DirectionPath({origin, destination}: DirectionPathProps) {
    return (
        <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
        />
    );
}
