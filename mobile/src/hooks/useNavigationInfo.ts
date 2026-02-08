import {create} from 'zustand';

interface NavigationInfoState {
    pathDistance: number;
    setPathDistance: (distance: number) => void;
    pathDuration: number;
    setPathDuration: (duration: number) => void;
}

const useNavigationInfo = create<NavigationInfoState>((set) => ({
    pathDistance: 0,
    setPathDistance: (distance: number) => set({pathDistance: distance}),
    pathDuration: 0,
    setPathDuration: (duration: number) => set({pathDuration: duration}),
}));

export default useNavigationInfo;