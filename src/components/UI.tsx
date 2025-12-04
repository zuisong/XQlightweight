
import type Phaser from 'phaser';
import type React from 'react';
import { useEffect, useState } from 'react';
import type MainScene from '../game/MainScene';
import RestartModal from './RestartModal';
import SettingsModal from './SettingsModal';

interface UIProps {
    gameInstance: Phaser.Game | null;
}

const UI: React.FC<UIProps> = ({ gameInstance }) => {
    const [scores, setScores] = useState({ red: 0, black: 0 });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRestartOpen, setIsRestartOpen] = useState(false);

    const getScene = () => {
        return gameInstance?.scene.getScene('MainScene') as MainScene;
    };

    useEffect(() => {
        if (!gameInstance) return;

        const scene = getScene();
        if (!scene) return;

        const updateScores = (newScores: { red: number, black: number }) => {
            setScores(newScores);
        };

        scene.events.on('update-score', updateScores);

        // Initial fetch
        setScores(scene.getScores());

        return () => {
            scene.events.off('update-score', updateScores);
        };
    }, [gameInstance]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '10px', // Reduced padding for mobile
            color: 'white',
            backgroundColor: '#444',
            boxSizing: 'border-box'
        }}>
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                scene={getScene() || null}
            />
            <RestartModal
                isOpen={isRestartOpen}
                onClose={() => setIsRestartOpen(false)}
                scene={getScene() || null}
            />

            {/* Control Buttons - Grid Layout */}
            <div style={{
                marginBottom: '15px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
            }}>
                <button onClick={() => setIsSettingsOpen(true)} style={buttonStyle}>设置</button>
                <button onClick={() => setIsRestartOpen(true)} style={buttonStyle}>重开</button>
                <button onClick={() => getScene()?.retract()} style={buttonStyle}>悔棋</button>
                <button onClick={() => getScene()?.recommend()} style={buttonStyle}>提示</button>
            </div>

            {/* Scores */}
            <div style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'space-around',
                backgroundColor: '#333',
                padding: '10px',
                borderRadius: '8px'
            }}>
                <div style={{ color: '#FF6B6B', fontWeight: 'bold' }}>红方: {scores.red}</div>
                <div style={{ color: '#4ECDC4', fontWeight: 'bold' }}>黑方: {scores.black}</div>
            </div>
        </div>
    );
};

const buttonStyle = {
    padding: '10px 0',
    cursor: 'pointer',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold'
};

export default UI;
