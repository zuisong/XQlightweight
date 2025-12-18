import type React from 'react';
import { useEffect, useState } from 'react';
import type MainScene from '../game/MainScene';
import './SettingsModal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    scene: MainScene | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, scene }) => {
    const [difficulty, setDifficulty] = useState(2); // Default Hard
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [_moveMode, setMoveMode] = useState(0);
    const [_handicap, setHandicap] = useState(0);
    const [animated, setAnimated] = useState(true);

    useEffect(() => {
        if (scene) {
            // Sync initial state if possible, though scene defaults are hardcoded
            // Ideally scene exposes getters
            setSoundEnabled(scene.soundEnabled);
            setMoveMode(scene.moveMode);
            setHandicap(scene.handicap);
            setAnimated(scene.animated);
            // Reverse map difficulty
            const diff = scene.difficulty;
            if (diff === 10) setDifficulty(0);
            else if (diff === 100) setDifficulty(1);
            else setDifficulty(2);
        }
    }, [scene]);

    const handleDifficultyChange = (level: number) => {
        setDifficulty(level);
        scene?.setDifficulty(level);
    };

    const handleSoundChange = (enabled: boolean) => {
        scene?.setSound(enabled);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">游戏设置</h2>

                <div>
                    <label className="modal-label">难度:</label>
                    <button type='button'
                        onClick={() => {
                            const nextDifficulty = (difficulty + 1) % 3;
                            handleDifficultyChange(nextDifficulty);
                        }}
                        className="difficulty-button"
                    >
                        {['入门', '业余', '专业'][difficulty]}
                    </button>
                </div>

                <div>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={(e) => handleSoundChange(e.target.checked)}
                            className="checkbox-input"
                        />
                        开启音效
                    </label>
                </div>

                <div>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={animated}
                            onChange={(e) => {
                                setAnimated(e.target.checked);
                                scene?.setAnimated(e.target.checked);
                            }}
                            className="checkbox-input"
                        />
                        开启动画
                    </label>
                </div>

                <div>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            defaultChecked={scene?.showScore ?? true}
                            onChange={(e) => scene?.setShowScore(e.target.checked)}
                            className="checkbox-input"
                        />
                        显示评分
                    </label>
                </div>

                <div className="modal-footer">
                    <button type='button' onClick={onClose} className="close-button">关闭</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
