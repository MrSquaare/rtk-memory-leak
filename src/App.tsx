import './App.css'
import {useEntityActions} from "./slice";

function App() {
    const entityActions = useEntityActions();

    return (
        <div className="App">
            <button onClick={() => entityActions.loadEntities()}>
                Dispatch entity/load
            </button>
            <br /> <br />
            <button onClick={() => entityActions.unloadEntities()}>
                Dispatch entity/unload
            </button>
            <br /> <br />
            <button onClick={() => entityActions.removeAll()}>
                Clear entity store
            </button>
        </div>
    );
}

export default App;
