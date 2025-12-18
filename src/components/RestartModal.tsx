import type React from 'react';
import { useEffect, useState } from 'react';
import type MainScene from '../game/MainScene';
import { Handicap, MoveMode } from '../types';
import './RestartModal.css';

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

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">重新开始</h2>

                <div>
                    <label className="modal-label">先手:</label>
                    <button
                        onClick={() => setMoveMode((moveMode + 1) % 3 as MoveMode)}
                        className="toggle-button"
                    >
                        {['玩家先手', '电脑先手', '双人对战'][moveMode]}
                    </button>
                </div>

                <div>
                    <label className="modal-label">让子:</label>
                    <button
                        onClick={() => setHandicap((handicap + 1) % 4 as Handicap)}
                        className="toggle-button"
                    >
                        {['无', '让左马', '让双马', '让九子'][handicap]}
                    </button>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="action-button cancel-button">取消</button>
                    <button onClick={handleConfirm} className="action-button confirm-button">确定</button>
                </div>
            </div>
        </div>
    );
};

export default RestartModal;
