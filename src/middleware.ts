import {
    bindActionCreators,
    createAction, createAsyncThunk,
    createListenerMiddleware,
} from "@reduxjs/toolkit";
import {useDispatch} from "react-redux";

type EntityData = [number, number][];

const entityDataLength = 100;

const generateFakeEntityData = (): EntityData => {
    return Array(entityDataLength).fill(null).map((_, index) => {
        return [index, index];
    });
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

export const loadEntities = createAction("entity/load");
export const unloadEntities = createAction("entity/unload");

export const entityActions = {
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
                entityIds.map(async (id) => {
                    // Leak
                    await forkApi.pause(api.dispatch(getEntity(id)));
                    // No more array leaks (but other things can be leaked too)
                    // await api.dispatch(getEntity(id));
                    // No more array leaks (but other things can be leaked too)
                    // await generateFakeEntity(id);
                });

                await api.delay(1000);
            }
        });

        await api.condition(unloadEntities.match);

        task.cancel();
    },
});
