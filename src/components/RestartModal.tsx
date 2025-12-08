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
                gap: '15px'
            }}>
                <h2 style={{ margin: 0, textAlign: 'center' }}>重新开始</h2>

                <div>
                    <label style={{ fontWeight: 'bold' }}>先手:</label>
                    <button
                        onClick={() => setMoveMode((moveMode + 1) % 3 as MoveMode)}
                        style={toggleButtonStyle}
                    >
                        {['玩家先手', '电脑先手', '双人对战'][moveMode]}
                    </button>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold' }}>让子:</label>
                    <button
                        onClick={() => setHandicap((handicap + 1) % 4 as Handicap)}
                        style={toggleButtonStyle}
                    >
                        {['无', '让左马', '让双马', '让九子'][handicap]}
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button onClick={onClose} style={{ ...actionButtonStyle, backgroundColor: '#6B7280' }}>取消</button>
                    <button onClick={handleConfirm} style={{ ...actionButtonStyle, backgroundColor: '#10B981' }}>确定</button>
                </div>
            </div>
        </div>
    );
};

const toggleButtonStyle = {
    marginTop: '5px',
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    textAlign: 'left' as const
};

const actionButtonStyle = {
    padding: '10px 30px',
    cursor: 'pointer',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px'
};

export default RestartModal;
