
import type Phaser from 'phaser';
import type React from 'react';
import { useEffect, useState } from 'react';
import type MainScene from '../game/MainScene';
import RestartModal from './RestartModal';
import SettingsModal from './SettingsModal';
import { EVENTS } from '../game/events';
import './UI.css';

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

        scene.events.on(EVENTS.UPDATE_SCORE, updateScores);
        scene.events.on(EVENTS.UPDATE_SETTINGS, updateSettings);

        // Initial fetch
        setScores(scene.getScores());
        setShowScore(scene.showScore);

        return () => {
            scene.events.off(EVENTS.UPDATE_SCORE, updateScores);
            scene.events.off(EVENTS.UPDATE_SETTINGS, updateSettings);
        };
    }, [scene]);

    return (
        <div className="ui-container">
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
            <div className="control-buttons-grid">
                <button type='button' onClick={() => setIsSettingsOpen(true)} className="ui-button">设置</button>
                <button type='button' onClick={() => setIsRestartOpen(true)} className="ui-button">重开</button>
                <button type='button' onClick={() => scene?.retract()} className="ui-button">悔棋</button>
                <button type='button' onClick={() => scene?.recommend()} className="ui-button">提示</button>
            </div>

            {/* Scores */}
            {showScore && (
                <div className="score-panel">
                    {(() => {
                        const total = scores.red + scores.black;
                        const redPercent = total === 0 ? 50 : Math.round((scores.red / total) * 100);
                        const blackPercent = total === 0 ? 50 : 100 - redPercent;

                        return (
                            <div className="score-bar-container">
                                {/* Red Bar */}
                                <div
                                    className="score-bar-red"
                                    style={{ width: `${redPercent}%` }}
                                >
                                    <span className="score-text">
                                        {redPercent > 10 ? `${redPercent}%` : ''}
                                    </span>
                                </div>

                                {/* Black Bar */}
                                <div
                                    className="score-bar-black"
                                    style={{ width: `${blackPercent}%` }}
                                >
                                    <span className="score-text">
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

export default UI;
