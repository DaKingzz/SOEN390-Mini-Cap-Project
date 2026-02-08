import {useState} from "react";
import {Coordinate} from "../type";

export default function useNavigationEndpoints() {
    const [origin, setOrigin] = useState<Coordinate>({longitude: 0, latitude: 0})
    const [destination, setDestination] = useState<Coordinate>({longitude: 0, latitude: 0})
    return {origin, setOrigin, destination, setDestination}
}