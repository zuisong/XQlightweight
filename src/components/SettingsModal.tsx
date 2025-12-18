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

    const overlayClass = "fixed top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center z-[1000]";
    const contentClass = "bg-[#333] p-5 rounded-[10px] text-white w-[90%] max-w-[400px] flex flex-col gap-[15px] max-h-[90vh] overflow-y-auto";
    const labelClass = "font-bold";
    const checkboxLabelClass = "flex items-center gap-2.5 font-bold cursor-pointer";
    const checkboxClass = "w-5 h-5";

    return (
        <div className={overlayClass}>
            <div className={contentClass}>
                <h2 className="m-0 text-center">游戏设置</h2>

                <div>
                    <label className={labelClass}>难度:</label>
                    <button type='button'
                        onClick={() => {
                            const nextDifficulty = (difficulty + 1) % 3;
                            handleDifficultyChange(nextDifficulty);
                        }}
                        className="mt-[5px] w-full p-2.5 rounded-[4px] bg-[#555] text-white border-none text-base cursor-pointer text-left"
                    >
                        {['入门', '业余', '专业'][difficulty]}
                    </button>
                </div>

                <div>
                    <label className={checkboxLabelClass}>
                        <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={(e) => handleSoundChange(e.target.checked)}
                            className={checkboxClass}
                        />
                        开启音效
                    </label>
                </div>

                <div>
                    <label className={checkboxLabelClass}>
                        <input
                            type="checkbox"
                            checked={animated}
                            onChange={(e) => {
                                setAnimated(e.target.checked);
                                scene?.setAnimated(e.target.checked);
                            }}
                            className={checkboxClass}
                        />
                        开启动画
                    </label>
                </div>

                <div>
                    <label className={checkboxLabelClass}>
                        <input
                            type="checkbox"
                            defaultChecked={scene?.showScore ?? true}
                            onChange={(e) => scene?.setShowScore(e.target.checked)}
                            className={checkboxClass}
                        />
                        显示评分
                    </label>
                </div>

                <div className="flex justify-center mt-2.5">
                    <button type='button' onClick={onClose} className="px-[30px] py-2.5 cursor-pointer bg-[#10B981] text-white border-none rounded-[5px] text-base">关闭</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
