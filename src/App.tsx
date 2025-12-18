import { useState } from 'react';
import Game from './components/Game';
import UI from './components/UI';
import './App.css';

function App() {
    const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);

    return (
        <div className="app-container">
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
