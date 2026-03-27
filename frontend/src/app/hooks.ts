// Bước 1: Import từ react-redux
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Bước 2: Import types từ store
import type { RootState, AppDispatch } from './store';

// Bước 3: Tạo typed hooks
// - useAppDispatch: Giống useDispatch nhưng có type
// - useAppSelector: Giống useSelector nhưng có type

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Tại sao cần typed hooks?
// - Để TypeScript tự động suggest properties
// - Để tránh lỗi type khi dispatch action
// - Để code "xịn" hơn và ít bug hơn
