
import type Phaser from 'phaser';
import type React from 'react';
import { useEffect, useState } from 'react';
import type MainScene from '../game/MainScene';
import RestartModal from './RestartModal';
import SettingsModal from './SettingsModal';
import { EVENTS } from '../game/events';

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

    const buttonClass = "py-2.5 cursor-pointer bg-[#555] text-white border-none rounded-[5px] text-sm font-bold";

    return (
        <div className="w-full h-full flex flex-col p-2.5 text-white bg-[#444] box-border">
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
            <div className="mb-[15px] grid grid-cols-4 gap-2">
                <button type='button' onClick={() => setIsSettingsOpen(true)} className={buttonClass}>设置</button>
                <button type='button' onClick={() => setIsRestartOpen(true)} className={buttonClass}>重开</button>
                <button type='button' onClick={() => scene?.retract()} className={buttonClass}>悔棋</button>
                <button type='button' onClick={() => scene?.recommend()} className={buttonClass}>提示</button>
            </div>

            {/* Scores */}
            {showScore && (
                <div className="mb-[15px] bg-[#333] p-2.5 rounded-lg">
                    {(() => {
                        const total = scores.red + scores.black;
                        const redPercent = total === 0 ? 50 : Math.round((scores.red / total) * 100);
                        const blackPercent = total === 0 ? 50 : 100 - redPercent;

                        return (
                            <div className="flex h-6 rounded-xl overflow-hidden relative bg-[#555]">
                                {/* Red Bar */}
                                <div
                                    className="bg-[#FF6B6B] flex items-center justify-start pl-2.5 transition-[width] duration-300 ease-out whitespace-nowrap overflow-hidden"
                                    style={{ width: `${redPercent}%` }}
                                >
                                    <span className="text-xs font-bold text-white">
                                        {redPercent > 10 ? `${redPercent}%` : ''}
                                    </span>
                                </div>

                                {/* Black Bar */}
                                <div
                                    className="bg-[#4ECDC4] flex items-center justify-end pr-2.5 transition-[width] duration-300 ease-out whitespace-nowrap overflow-hidden"
                                    style={{ width: `${blackPercent}%` }}
                                >
                                    <span className="text-xs font-bold text-white">
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
