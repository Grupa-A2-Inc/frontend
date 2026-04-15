import { create } from "zustand";

import { AdminDashboardStats, OrganizationProfile } from "./types";

// Definim forma (schema) store-ului nostru global
// Acesta va tine datele dashboard-ului in memorie intre navigari
type DashboardStore = {
    stats: AdminDashboardStats | null; // datele KPI-urilor
    organization: OrganizationProfile | null; // profilul organizatiei
    setStats: (stats: AdminDashboardStats | null) => void; // functie pentru actualizarea KPI-urilor
    setOrganization: (org: OrganizationProfile | null) => void; // functie pentru actualizarea organizatiei
    reset: () => void; // resetare completa
};

// Cream store-ul global folosind Zustand
export const useDashboardStore = create<DashboardStore>((set) => ({
    // Valorile initiale - null inseamna "nu avem inca date"
    stats: null,
    organization: null,

    // Functie pentru actualizarea KPI-urilor
    setStats: (stats) => set({ stats }),

    // Functie pentru actualizarea datelor organizatiei
    setOrganization: (organization) => set({ organization }),

    // Reset complet 
    reset: () => set({ stats: null, organization: null }),
}));