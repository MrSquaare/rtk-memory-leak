import {
    bindActionCreators,
    createAction, createAsyncThunk,
    createEntityAdapter,
    createListenerMiddleware,
    createSlice
} from "@reduxjs/toolkit";
import {useDispatch} from "react-redux";
import {StoreState} from "./store";

type EntityData = [number, number][];

const entityDataLength = 100;

const generateFakeEntityData = (): EntityData => {
    return Array(entityDataLength).fill(null).map((_, index) => {
        return [index, index];
    });
}

const mergeEntityData = (a: EntityData, b: EntityData) => {
    return [...a.slice(0, entityDataLength / 2), ...b.slice(entityDataLength / 2)];
}

type Entity = {
    id: string;
    data: EntityData;
}

const generateFakeEntity = async (id: string): Promise<Entity> => {
    return {
        id,
        data: generateFakeEntityData(),
    }
}

const getEntity = createAsyncThunk<Entity, string>("entity/get", async (id) => {
    return generateFakeEntity(id);
});

const entityAdapter = createEntityAdapter<Entity>();
const entitySelectors = entityAdapter.getSelectors();

export const entitySlice = createSlice({
    name: "entity",
    initialState: entityAdapter.getInitialState(),
    reducers: {
        upsertOne: (state, action) => {
            entityAdapter.upsertOne(state, action.payload);
        },
        removeAll:  (state) => {
            entityAdapter.removeAll(state);
        },
    }
});

export const loadEntities = createAction("entity/load");
export const unloadEntities = createAction("entity/unload");

export const entityActions = {
    ...entitySlice.actions,
    loadEntities,
    unloadEntities,
}

export const useEntityActions = () => {
    const dispatch = useDispatch();

    return bindActionCreators(entityActions, dispatch);
}

export const entityMiddleware = createListenerMiddleware();

export const entityIds = ["a", "b", "c"];

entityMiddleware.startListening({
    actionCreator: loadEntities,
    effect: async (action, api) => {
        const task = api.fork(async (forkApi) => {
            while (!forkApi.signal.aborted) {
                const promises = entityIds.map(async (id) => {
                    const state = api.getState() as StoreState;
                    const prevEntity = entitySelectors.selectById(state.entity, id);
                    const newEntity = await forkApi.pause(api.dispatch(getEntity(id)));

                    if (getEntity.fulfilled.match(newEntity)) {
                        return {
                            id,
                            data: prevEntity
                                ? mergeEntityData(prevEntity.data, newEntity.payload.data)
                                : newEntity.payload.data,
                        };
                    }
                });

                promises.forEach((promise) => {
                    promise?.then((res) => {
                        api.dispatch(entitySlice.actions.upsertOne(res));
                    });
                })

                await api.delay(1000);
            }
        });

        await api.condition(unloadEntities.match);

        task.cancel();
    },
});
