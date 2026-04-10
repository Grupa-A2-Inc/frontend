import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/index";

// Hook personalizat pentru dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// Hook personalizat pentru selector
export const useAppSelector = useSelector.withTypes<RootState>();
