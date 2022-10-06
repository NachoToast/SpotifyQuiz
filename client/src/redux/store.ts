import { configureStore } from '@reduxjs/toolkit';
import mainReducer from './mainSlice';

export const store = configureStore({
    reducer: {
        main: mainReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
