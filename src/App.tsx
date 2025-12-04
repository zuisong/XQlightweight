import React, { useState } from 'react';
import Game from './components/Game';
import UI from './components/UI';

import type { PixiManager } from './game/PixiManager';

function App() {
    const [gameInstance, setGameInstance] = useState<PixiManager | null>(null);

    return (
        <div className="app-root">
            <div className="game-wrapper">
                <Game setGameInstance={setGameInstance} />
            </div>
            <div className="ui-wrapper">
                <UI gameInstance={gameInstance} />
            </div>
        </div>
    );
}

export default App;
