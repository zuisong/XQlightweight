import Phaser from 'phaser';
import type React from 'react';
import { useEffect, useRef } from 'react';
import MainScene from '../game/MainScene';

interface GameProps {
    setGameInstance: (game: Phaser.Game) => void;
}

const Game: React.FC<GameProps> = ({ setGameInstance }) => {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!gameRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 521, // Total Width Horizontal from constants
            height: 577, // Board Height from constants
            parent: gameRef.current,
            scene: [MainScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            backgroundColor: '#333333',
            dom: {
                createContainer: true
            }
        };

        const game = new Phaser.Game(config);
        setGameInstance(game);

        return () => {
            game.destroy(true);
        };
    }, [setGameInstance]);

    return <div ref={gameRef} style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', position: 'relative' }} />;
};

export default Game;
