import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import SpotifyToken from '../../../shared/SpotifyToken';

export interface MainState {
    test?: SpotifyToken;
}

const initialState: MainState = {};

export const mainSlice = createSlice({
    name: 'main',
    initialState,
    reducers: {
        setTest: (state, action: PayloadAction<SpotifyToken>) => {
            state.test = action.payload;
        },
    },
});

export const { setTest } = mainSlice.actions;

export const selectTest = (state: RootState) => state.main.test;

export default mainSlice.reducer;
