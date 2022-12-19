import {configureStore, ListenerEffectAPI} from "@reduxjs/toolkit";
import {entityMiddleware, entitySlice} from "./slice";

export const store = configureStore({
    reducer: {
        [entitySlice.name]: entitySlice.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat([entityMiddleware.middleware]);
    }
});

export type StoreDispatch = typeof store.dispatch;
export type StoreState = ReturnType<typeof store.getState>;
export type StoreListenerEffectAPI = ListenerEffectAPI<StoreState, StoreDispatch>;
