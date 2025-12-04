import { Application } from 'pixi.js';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { PixiManager } from '../game/PixiManager';

interface GameProps {
    setGameInstance: (game: PixiManager) => void;
}

const Game: React.FC<GameProps> = ({ setGameInstance }) => {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!gameRef.current) return;

        const app = new Application();
        let mounted = true;
        let initialized = false;

        const init = async () => {
            await app.init({
                width: 521,
                height: 577,
                backgroundColor: '#333333',
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });

            if (!mounted) {
                app.destroy(true, { children: true, texture: true });
                return;
            }

            initialized = true;

            if (gameRef.current) {
                gameRef.current.appendChild(app.canvas);
            }

            const manager = new PixiManager(app);
            await manager.init();

            if (mounted) {
                setGameInstance(manager);
            }
        };

        init();

        return () => {
            mounted = false;
            if (initialized) {
                app.destroy(true, { children: true, texture: true });
            }
        };
    }, [setGameInstance]);

    return <div ref={gameRef} style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }} />;
};

export default Game;
