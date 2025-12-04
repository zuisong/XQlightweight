import type React from 'react';
import { useEffect, useState } from 'react';
import type MainScene from '../game/MainScene';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    scene: MainScene | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, scene }) => {
    const [difficulty, setDifficulty] = useState(2); // Default Hard
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [moveMode, setMoveMode] = useState(0);
    const [handicap, setHandicap] = useState(0);

    useEffect(() => {
        if (scene) {
            // Sync initial state if possible, though scene defaults are hardcoded
            // Ideally scene exposes getters
            setSoundEnabled(scene.soundEnabled);
            setMoveMode(scene.moveMode);
            setHandicap(scene.handicap);
            // Reverse map difficulty
            const diff = scene.difficulty;
            if (diff === 10) setDifficulty(0);
            else if (diff === 100) setDifficulty(1);
            else setDifficulty(2);
        }
    }, [scene, isOpen]);

    const handleDifficultyChange = (level: number) => {
        setDifficulty(level);
        scene?.setDifficulty(level);
    };

    const handleSoundChange = (enabled: boolean) => {
        setSoundEnabled(enabled);
        scene?.setSound(enabled);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#333',
                padding: '20px',
                borderRadius: '10px',
                color: 'white',
                width: '90%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h2 style={{ margin: 0, textAlign: 'center' }}>游戏设置</h2>

                <div>
                    <label style={{ fontWeight: 'bold' }}>难度:</label>
                    <button
                        onClick={() => {
                            const nextDifficulty = (difficulty + 1) % 3;
                            handleDifficultyChange(nextDifficulty);
                        }}
                        style={{
                            marginTop: '5px',
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            backgroundColor: '#555',
                            color: 'white',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        {['入门', '业余', '专业'][difficulty]}
                    </button>
                </div>



                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={(e) => handleSoundChange(e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                        开启音效
                    </label>
                </div>

                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            onChange={(e) => scene?.setAnimated(e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                        开启动画
                    </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <button onClick={onClose} style={{ padding: '10px 30px', cursor: 'pointer', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px' }}>关闭</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
