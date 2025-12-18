import type React from 'react';
import { useEffect, useState } from 'react';
import type MainScene from '../game/MainScene';
import { Handicap, MoveMode } from '../types';

interface RestartModalProps {
    isOpen: boolean;
    onClose: () => void;
    scene: MainScene | null;
}

const RestartModal: React.FC<RestartModalProps> = ({ isOpen, onClose, scene }) => {
    const [moveMode, setMoveMode] = useState<MoveMode>(0);
    const [handicap, setHandicap] = useState<Handicap>(0);

    useEffect(() => {
        if (isOpen && scene) {
            setMoveMode(scene.moveMode);
            setHandicap(scene.handicap);
        }
    }, [isOpen, scene]);

    const handleConfirm = () => {
        if (scene) {
            scene.setMoveMode(moveMode as MoveMode);
            scene.setHandicap(handicap as Handicap);
            scene.restart();
        }
        onClose();
    };

    if (!isOpen) return null;

    const overlayClass = "fixed top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center z-[1000]";
    const contentClass = "bg-[#333] p-5 rounded-[10px] text-white w-[90%] max-w-[400px] flex flex-col gap-[15px]";

    return (
        <div className={overlayClass}>
            <div className={contentClass}>
                <h2 className="m-0 text-center">重新开始</h2>

                <div>
                    <label className="font-bold">先手:</label>
                    <button
                        onClick={() => setMoveMode((moveMode + 1) % 3 as MoveMode)}
                        className="mt-[5px] w-full p-2.5 rounded-[4px] bg-[#555] text-white border-none text-base cursor-pointer text-left"
                    >
                        {['玩家先手', '电脑先手', '双人对战'][moveMode]}
                    </button>
                </div>

                <div>
                    <label className="font-bold">让子:</label>
                    <button
                        onClick={() => setHandicap((handicap + 1) % 4 as Handicap)}
                        className="mt-[5px] w-full p-2.5 rounded-[4px] bg-[#555] text-white border-none text-base cursor-pointer text-left"
                    >
                        {['无', '让左马', '让双马', '让九子'][handicap]}
                    </button>
                </div>

                <div className="flex justify-between mt-2.5">
                    <button onClick={onClose} className="px-[30px] py-2.5 cursor-pointer text-white border-none rounded-[5px] text-base bg-[#6B7280]">取消</button>
                    <button onClick={handleConfirm} className="px-[30px] py-2.5 cursor-pointer text-white border-none rounded-[5px] text-base bg-[#10B981]">确定</button>
                </div>
            </div>
        </div>
    );
};

export default RestartModal;
