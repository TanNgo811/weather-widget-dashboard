import { create } from 'zustand'


export interface AppPersistentData {
    mainWeatherLoading: boolean
}

export interface AppState extends AppPersistentData {
    setMainWeatherLoading: (loading: boolean) => void;
}

export const DEFAULT_APP_STATE: AppPersistentData = {
    mainWeatherLoading: true,
};

export const useAppStore = create<AppState>((set) => ({
    ...DEFAULT_APP_STATE,
    setMainWeatherLoading: (loading: boolean) => set({ mainWeatherLoading: loading }),
}));
