import { type Board, RESULT_UNKNOWN } from "./board.ts"
import { ASC, CHR, DST, FILE_LEFT, FILE_X, RANK_TOP, RANK_Y, SRC } from "./engine/position.ts"; // Directly from position.ts

const board = () => window.board

export const selMoveMode = () => document.getElementById('selMoveMode')! as HTMLSelectElement
export const selHandicap = () => document.getElementById('selHandicap')! as HTMLSelectElement
export const selLevel = () => document.getElementById('selLevel')! as HTMLSelectElement
export const selMoveList = () => document.getElementById("selMoveList")! as HTMLElement

const STARTUP_FEN = [
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKAB1R w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w",
];


export function move2Iccs(mv: number): string {
    const sqSrc = SRC(mv);
    const sqDst = DST(mv);
    return `${CHR(ASC("A") + FILE_X(sqSrc) - FILE_LEFT) +
        CHR(ASC("9") - RANK_Y(sqSrc) + RANK_TOP)}-${CHR(ASC("A") + FILE_X(sqDst) - FILE_LEFT)}${CHR(ASC("9") - RANK_Y(sqDst) + RANK_TOP)}`;
}

export function level_change() {
    board().millis = 10 ** (selLevel().selectedIndex + 1);
}

export function restart_click() {
    const moveList = selMoveList();
    while (moveList.firstChild) {
        moveList.removeChild(moveList.firstChild);
    }
    const moveItem = document.createElement("li");
    moveItem.className = "move-item selected";
    moveItem.dataset.value = "0";
    moveItem.dataset.index = "0";
    moveItem.innerHTML = "=== 开始 ===";
    moveList.appendChild(moveItem);

    board().computer = 1 - selMoveMode().selectedIndex;
    board().restart(STARTUP_FEN[selHandicap().selectedIndex]);
}

export function retract_click() {
    const moveList = selMoveList();
    for (let i = board().engine.getHistoryLength(); i < moveList.children.length; i++) {
        // Here, makeInternalMove expects an internal move number, but moveList.children[i].dataset.value!
        // is the internal move number that was stored. So, Number.parseInt is correct.
        board().engine.makeInternalMove(Number.parseInt(moveList.children[i].dataset.value!));
    }
    board().retract();
    // Remove extra moves from the list
    while (moveList.children.length > board().engine.getHistoryLength()) {
        moveList.removeChild(moveList.lastChild!);
    }
    // Set the last move as selected
    if (moveList.children.length > 0) {
        moveList.lastChild!.classList.add('selected');
    }
}

declare global {
    interface Window {
        board: Board
    }
}
