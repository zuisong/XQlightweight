import './index.css';
import { ExcaliburBoard } from "./excalibur-board";

const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Define the save and load functions that interact with localStorage
const onSaveGame = (fen: string) => {
    localStorage.setItem('xqlightweight_game_state', fen);
};

const onLoadGame = (): string | null => {
    return localStorage.getItem('xqlightweight_game_state');
};

const excaliburBoard = new ExcaliburBoard({
    containerId: "game",
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    isDarkMode: isDark,
    setBackgroundColor: (color: string) => {
        document.body.style.backgroundColor = color;
    },
    onSaveGame: onSaveGame,
    onLoadGame: onLoadGame
});