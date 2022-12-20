import './App.css'
import {useEntityActions} from "./middleware";

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
        </div>
    );
}

export default App;
