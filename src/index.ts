import { ASC, Board, CHR, DST, FILE_LEFT, FILE_X, RANK_TOP, RANK_Y, RESULT_UNKNOWN, SRC } from "./xiangqi-ai.ts"

let STARTUP_FEN = [
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKAB1R w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKAB1R w",
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w",
];


function move2Iccs(mv: number) {
    let sqSrc = SRC(mv);
    let sqDst = DST(mv);
    return CHR(ASC("A") + FILE_X(sqSrc) - FILE_LEFT) +
        CHR(ASC("9") - RANK_Y(sqSrc) + RANK_TOP) + "-" +
        CHR(ASC("A") + FILE_X(sqDst) - FILE_LEFT) +
        CHR(ASC("9") - RANK_Y(sqDst) + RANK_TOP);
}

function createOption(text: string, value: string, ie8: boolean) {
    let opt = document.createElement("option");
    opt.selected = true;
    opt.value = value;
    if (ie8) {
        opt.text = text;
    } else {
        opt.innerHTML = text.replace(/ /g, "&nbsp;");
    }
    return opt;
}

let selMoveList = document.getElementById("selMoveList")!! as HTMLSelectElement

let selMoveMode = document.getElementById('selMoveMode')!! as HTMLSelectElement
let selHandicap = document.getElementById('selHandicap')!! as HTMLSelectElement
let selLevel = document.getElementById('selLevel')!! as HTMLSelectElement

let container = document.getElementById("board_1")!!

let board = new Board(container, "images/", "sounds/");
//@ts-ignore
window.board = board
board.setSearch(16);
board.millis = 10;
board.computer = 1;
const _this = board;
board.onAddMove = function () {
    let counter: number | string = (board.pos.mvList.length >> 1);
    let space = (counter > 99 ? "    " : "   ");
    counter = (counter > 9 ? "" : " ") + counter + ".";
    let text = (board.pos.sdPlayer == 0 ? space : counter) + move2Iccs(board.mvLast);
    let value = "" + board.mvLast;
    try {
        selMoveList.add(createOption(text, value, false));
    } catch (e) {
        selMoveList.add(createOption(text, value, true));
    }
    selMoveList.scrollTop = selMoveList.scrollHeight;
};

//@ts-ignore
window.level_change = function level_change() {
    board.millis = Math.pow(10, selLevel.selectedIndex + 1);
}
//@ts-ignore
window.restart_click = function restart_click() {
    selMoveList.options.length = 1;
    selMoveList.selectedIndex = 0;
    board.computer = 1 - selMoveMode.selectedIndex;
    board.restart(STARTUP_FEN[selHandicap.selectedIndex]);
}

export function retract_click() {
    for (let i = board.pos.mvList.length; i < selMoveList.options.length; i++) {
        board.pos.makeMove(parseInt(selMoveList.options[i].value));
    }
    board.retract();
    selMoveList.options.length = board.pos.mvList.length;
    selMoveList.selectedIndex = selMoveList.options.length - 1;
}

//@ts-ignore
window.retract_click = retract_click
export function moveList_change() {
    if (board.result == RESULT_UNKNOWN) {
        selMoveList.selectedIndex = selMoveList.options.length - 1;
        return;
    }
    let from = board.pos.mvList.length;
    let to = selMoveList.selectedIndex;
    if (from == to + 1) {
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
//@ts-ignore
window.moveList_change = moveList_change