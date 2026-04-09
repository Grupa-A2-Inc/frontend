// Importăm hook-urile standard din React Redux.
import { useDispatch, useSelector } from "react-redux";

// Importăm tipurile definite în store/index.ts.
// RootState = tipul complet al stării globale.
// AppDispatch = tipul funcției dispatch.
import type { RootState, AppDispatch } from "./index";

// Definim un hook personalizat pentru dispatch.
// Acesta se asigură că acțiunile trimise sunt tipate corect.
// Folosim AppDispatch pentru a avea autocomplete și validare TypeScript.
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Definim un hook personalizat pentru selector.
// Acesta permite accesarea stării globale cu tipare corecte.
// RootState asigură că avem autocomplete pentru toate slice-urile.
export const useAppSelector = useSelector.withTypes<RootState>();