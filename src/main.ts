import './index.css';
import { ExcaliburBoard } from "./excalibur-board";

const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const board = new ExcaliburBoard({
    containerId: "game",
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    isDarkMode: isDark,
    setBackgroundColor: (color: string) => {
        document.body.style.backgroundColor = color;
    }
});
(window as any).board = board;