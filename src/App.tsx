import { useState } from 'react';
import Game from './components/Game';
import UI from './components/UI';

function App() {
    const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);

    return (
        <div style={{
            width: '100vw',
            height: '100vh', // Use 100vh to ensure full screen
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center', // Centers items in the cross axis (if not wrapped)
            alignContent: 'center', // Centers wrapped lines vertically
            backgroundColor: '#333',
            flexWrap: 'wrap',
            overflow: 'hidden', // Prevent scroll if possible, let UI scroll
            padding: '10px',
            gap: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '521px',
                aspectRatio: '521/577',
                flexShrink: 0,
                maxHeight: '60vh', // Limit board height on small screens to leave room for UI
            }}>
                <Game setGameInstance={setGameInstance} />
            </div>
            <div style={{
                width: '100%',
                maxWidth: '521px',
                height: 'auto',
                flex: '1 1 300px', // Allow growing, min 300px
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', // Contain UI scroll
                maxHeight: '35vh' // Limit UI height so it doesn't push board off?
                // Actually, if we want "fill area below", flex: 1 is good.
                // But we need to be careful about overflow.
            }}>
                <UI gameInstance={gameInstance} />
            </div>
        </div>
    );
}

export default App;
