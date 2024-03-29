import React from 'react';
import './App.css';

import {DraftManager} from "./DraftManager";


function App() {
    return (
        <div className="App">
            <header className="App-header">
                <DraftManager defaultTeamCount={6}/>
            </header>
        </div>
    );
}

export default App;
