import {create} from 'zustand';
import {TransportMode} from "../type";

interface NavigationConfigState {
    navigationMode: TransportMode;
    setNavigationMode: (mode: TransportMode) => void;
}

const useNavigationConfig = create<NavigationConfigState>((set) => ({
    navigationMode: 'WALK',
    setNavigationMode: (mode: TransportMode) => set({navigationMode: mode}),
}));

export default useNavigationConfig;