import { Board, RESULT_UNKNOWN } from "./board.ts"
import { ASC, CHR, DST, FILE_LEFT, FILE_X, RANK_TOP, RANK_Y, SRC } from "./position.ts";

const STARTUP_FEN = [
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKAB1R w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKAB1R w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w",
];


function move2Iccs(mv: number) : string{
    const sqSrc = SRC(mv);
    const sqDst = DST(mv);
    return CHR(ASC("A") + FILE_X(sqSrc) - FILE_LEFT) +
        CHR(ASC("9") - RANK_Y(sqSrc) + RANK_TOP) + "-" +
        CHR(ASC("A") + FILE_X(sqDst) - FILE_LEFT) +
        CHR(ASC("9") - RANK_Y(sqDst) + RANK_TOP);
}

function createOption(text: string, value: string) {
    const opt: HTMLOptionElement = document.createElement("option");
    opt.selected = true;
    opt.value = value;
    opt.innerHTML = text.replace(/ /g, "&nbsp;");
    return opt;
}

const selMoveList = document.getElementById("selMoveList")!! as HTMLSelectElement

const selMoveMode = document.getElementById('selMoveMode')!! as HTMLSelectElement
const selHandicap = document.getElementById('selHandicap')!! as HTMLSelectElement
const selLevel = document.getElementById('selLevel')!! as HTMLSelectElement

const container = document.getElementById("container")!!

const board = new Board(container, "images/", "sounds/");
window.board = board
board.setSearch(16);
board.millis = 10;
board.computer = 1;
board.onAddMove = () => {
  const counter: number = (board.pos.mvList.length >> 1);
  const space = (counter > 99 ? "    " : "   ");
  const text = (board.pos.sdPlayer == 0 ? space : ((counter > 9 ? "" : " ") + counter + ".")) + move2Iccs(board.mvLast);
  const value = "" + board.mvLast;
  selMoveList.add(createOption(text, value));
  selMoveList.scrollTop = selMoveList.scrollHeight;
};

function level_change() {
    board.millis = Math.pow(10, selLevel.selectedIndex + 1);
}
window.level_change = level_change
export function restart_click() {
    selMoveList.options.length = 1;
    selMoveList.selectedIndex = 0;
    board.computer = 1 - selMoveMode.selectedIndex;
    board.restart(STARTUP_FEN[selHandicap.selectedIndex]);
}
window.restart_click = restart_click

export function retract_click() {
    for (let i = board.pos.mvList.length; i < selMoveList.options.length; i++) {
        board.pos.makeMove(parseInt(selMoveList.options[i].value));
    }
    board.retract();
    selMoveList.options.length = board.pos.mvList.length;
    selMoveList.selectedIndex = selMoveList.options.length - 1;
}

window.retract_click = retract_click

export function moveList_change() {
    if (board.result === RESULT_UNKNOWN) {
        selMoveList.selectedIndex = selMoveList.options.length - 1;
        return;
    }
    const from = board.pos.mvList.length;
    const to = selMoveList.selectedIndex;
    if (from === to + 1) {
        return;
    }
    if (from > to + 1) {
        for (let i = to + 1; i < from; i++) {
            board.pos.undoMakeMove();
        }
    } else {
        for (let i = from; i <= to; i++) {
            board.pos.makeMove(parseInt(selMoveList.options[i].value));
        }
    }
    board.flushBoard();


}

window.moveList_change = moveList_change

declare global {
    interface Window {
        moveList_change: typeof moveList_change
        retract_click: typeof retract_click
        restart_click: typeof restart_click
        level_change: typeof level_change
        board: typeof board
    }
}
