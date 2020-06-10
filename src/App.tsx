import React from 'react';
import './App.css';

import {DraftManager} from "./DraftManager";


function App() {
    return (
        <div className="App">
            <header className="App-header">
                <DraftManager  teamCount={12}/>
            </header>
        </div>
    );
}

export default App;
