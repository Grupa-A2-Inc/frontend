import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/index";

/** Use instead of plain `useDispatch` for correct thunk types. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Use instead of plain `useSelector` for typed state access. */
export const useAppSelector = useSelector.withTypes<RootState>();
