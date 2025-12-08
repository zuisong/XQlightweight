
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
    const [showScore, setShowScore] = useState(true);
    const [scene, setScene] = useState<MainScene | null>(null);

    // Cache scene instance
    useEffect(() => {
        if (gameInstance) {
            const mainScene = gameInstance.scene.getScene('MainScene') as MainScene;
            setScene(mainScene);
        }
    }, [gameInstance]);

    useEffect(() => {
        if (!scene) return;

        const updateScores = (newScores: { red: number, black: number }) => {
            setScores(newScores);
        };

        const updateSettings = () => {
            setShowScore(scene.showScore);
        };

        scene.events.on('update-score', updateScores);
        scene.events.on('update-settings', updateSettings);

        // Initial fetch
        setScores(scene.getScores());
        setShowScore(scene.showScore);

        return () => {
            scene.events.off('update-score', updateScores);
            scene.events.off('update-settings', updateSettings);
        };
    }, [scene]);

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
                scene={scene}
            />
            <RestartModal
                isOpen={isRestartOpen}
                onClose={() => setIsRestartOpen(false)}
                scene={scene}
            />

            {/* Control Buttons - Grid Layout */}
            <div style={{
                marginBottom: '15px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
            }}>
                <button type='button' onClick={() => setIsSettingsOpen(true)} style={buttonStyle}>设置</button>
                <button type='button' onClick={() => setIsRestartOpen(true)} style={buttonStyle}>重开</button>
                <button type='button' onClick={() => scene?.retract()} style={buttonStyle}>悔棋</button>
                <button type='button' onClick={() => scene?.recommend()} style={buttonStyle}>提示</button>
            </div>

            {/* Scores */}
            {showScore && (
                <div style={{
                    marginBottom: '15px',
                    backgroundColor: '#333',
                    padding: '10px',
                    borderRadius: '8px'
                }}>
                    {(() => {
                        const total = scores.red + scores.black;
                        const redPercent = total === 0 ? 50 : Math.round((scores.red / total) * 100);
                        const blackPercent = total === 0 ? 50 : 100 - redPercent;

                        return (
                            <div style={{
                                display: 'flex',
                                height: '24px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundColor: '#555'
                            }}>
                                {/* Red Bar */}
                                <div style={{
                                    width: `${redPercent}%`,
                                    backgroundColor: '#FF6B6B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    paddingLeft: '10px',
                                    transition: 'width 0.3s ease',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>
                                        {redPercent > 10 ? `${redPercent}%` : ''}
                                    </span>
                                </div>

                                {/* Black Bar */}
                                <div style={{
                                    width: `${blackPercent}%`,
                                    backgroundColor: '#4ECDC4',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    paddingRight: '10px',
                                    transition: 'width 0.3s ease',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>
                                        {blackPercent > 10 ? `${blackPercent}%` : ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
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
