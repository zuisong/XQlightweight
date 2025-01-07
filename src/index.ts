import { type Board, RESULT_UNKNOWN } from "./board.ts"
import { ASC, CHR, DST, FILE_LEFT, FILE_X, RANK_TOP, RANK_Y, SRC } from "./position.ts";

const board = () => window.board

export const selMoveMode = () => document.getElementById('selMoveMode')! as HTMLSelectElement
export const selHandicap = () => document.getElementById('selHandicap')! as HTMLSelectElement
export const selLevel = () => document.getElementById('selLevel')! as HTMLSelectElement
export const selMoveList = () => document.getElementById("selMoveList")! as HTMLSelectElement

const STARTUP_FEN = [
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKAB1R w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKAB1R w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w",
];


export function move2Iccs(mv: number): string {
    const sqSrc = SRC(mv);
    const sqDst = DST(mv);
    // biome-ignore lint/style/useTemplate: <explanation>
    return CHR(ASC("A") + FILE_X(sqSrc) - FILE_LEFT) +
        CHR(ASC("9") - RANK_Y(sqSrc) + RANK_TOP) + "-" +
        CHR(ASC("A") + FILE_X(sqDst) - FILE_LEFT) +
        CHR(ASC("9") - RANK_Y(sqDst) + RANK_TOP);
}

export function createOption(text: string, value: string) {
    const opt: HTMLOptionElement = document.createElement("option");
    opt.selected = true;
    opt.value = value;
    opt.innerHTML = text.replace(" ", "&nbsp;");
    return opt;
}

export function level_change() {
    board().millis = 10 ** (selLevel().selectedIndex + 1);
}

export function restart_click() {
    selMoveList().options.length = 1;
    selMoveList().selectedIndex = 0;
    board().computer = 1 - selMoveMode().selectedIndex;
    board().restart(STARTUP_FEN[selHandicap().selectedIndex]);
}

export function retract_click() {
    for (let i = board().pos.mvList.length; i < selMoveList().options.length; i++) {
        board().pos.makeMove(Number.parseInt(selMoveList().options[i].value));
    }
    board().retract();
    selMoveList().options.length = board().pos.mvList.length;
    selMoveList().selectedIndex = selMoveList().options.length - 1;
}

export function moveList_change() {
    if (board().result === RESULT_UNKNOWN) {
        selMoveList().selectedIndex = selMoveList().options.length - 1;
        return;
    }
    const from = board().pos.mvList.length;
    const to = selMoveList().selectedIndex;
    if (from === to + 1) {
        return;
    }
    if (from > to + 1) {
        for (let i = to + 1; i < from; i++) {
            board().pos.undoMakeMove();
        }
    } else {
        for (let i = from; i <= to; i++) {
            board().pos.makeMove(Number.parseInt(selMoveList().options[i].value));
        }
    }
    board().flushBoard();
}

declare global {
    interface Window {
        board: Board
    }
}
