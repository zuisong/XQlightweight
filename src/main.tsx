import './index.css';
/** @jsx h */
import { h, render } from "https://esm.sh/preact@10?target=es2015";
import { Board, THINKING_LEFT, THINKING_TOP } from "./board.ts";
import {
  createOption,
  level_change,
  move2Iccs,
  moveList_change,
  restart_click,
  retract_click,
  selMoveList,
} from "./index.ts";

h!;

export function App() {
  return (
    <div class="app-container">
      <h1 class="title">象棋小巫师</h1>
      <div class="game-area">
        <div class="game-board-container">
          <div id="container">
            <img
              id="thinking"
              alt={"thinking"}
              src={"images/thinking.gif"}
              style={{
                visibility: "hidden",
                position: "absolute",
                left: THINKING_LEFT,
                top: THINKING_TOP,
              }}
            />
          </div>
        </div>
        <div class="controls-sidebar">
          <div class="control-card">
            <h2 class="card-title">Game Controls</h2>
            <div class="button-group">
                <button class="button button-primary" onClick={restart_click}>重新开始</button>
                <button class="button button-secondary" onClick={retract_click}>悔棋</button>
            </div>
          </div>
          <div class="control-card">
            <h2 class="card-title">Settings</h2>
            <div class="control-group select-group">
                <label for="selMoveMode" class="label">谁先走</label>
                <select id="selMoveMode">
                    <option selected value="0">我先走</option>
                    <option value="1">电脑先走</option>
                    <option value="2">不用电脑</option>
                </select>
            </div>
            <div class="control-group select-group">
                <label for="selHandicap" class="label">先走让子</label>
                <select id="selHandicap">
                    <option selected value="0">不让子</option>
                    <option value="1">让左马</option>
                    <option value="2">让双马</option>
                    <option value="3">让九子</option>
                </select>
            </div>
             <div class="control-group select-group">
                <label for="selLevel" class="label">电脑水平</label>
                <select id="selLevel" onChange={level_change}>
                    <option selected value="0">入门</option>
                    <option value="1">业余</option>
                    <option value="2">专业</option>
                </select>
            </div>
          </div>
          <div class="control-card">
            <h2 class="card-title">Preferences</h2>
            <div class="toggle-group">
              <label for="chkAnimated" class="label">动画</label>
              <label class="toggle-switch">
                <input type="checkbox" id="chkAnimated" checked onClick={(e) => { board.animated = e.currentTarget.checked }} />
                <span class="slider"></span>
              </label>
            </div>
            <div class="toggle-group">
                <label for="chkSound" class="label">音效</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="chkSound" checked onClick={(e) => board.setSound(e.currentTarget.checked)} />
                    <span class="slider"></span>
                </label>
            </div>
          </div>
        </div>
                           <div class="control-card" style="display: flex; flex-direction: column; height: 100%;">
                               <h2 class="card-title">Moves</h2>
                               <div class="move-list-container">
                                   <ul id="selMoveList" class="move-list">
                                       <li class="move-item selected" data-value="0" data-index="0" onClick={handleMoveClick}>=== 开始 ===</li>
                                   </ul>
                               </div>
                           </div>      </div>
    </div>
  );
}


const handleMoveClick = (e: any) => {
  if (board.result !== RESULT_UNKNOWN) {
    const from = board.pos.mvList.length;
    const to = parseInt(e.currentTarget.dataset.index, 10);
    if (from === to + 1) {
        return;
    }
    if (from > to + 1) {
        for (let i = to + 1; i < from; i++) {
            board.pos.undoMakeMove();
        }
    } else {
        for (let i = from; i <= to; i++) {
            board.pos.makeMove(Number(selMoveList().children[i].dataset.value));
        }
    }
    board.flushBoard();
  }
}

render(App(), document.body!);

const container = document.getElementById("container")!;

const board = new Board(container, "images/", "sounds/");
window.board = board;
board.setSearch(16);
board.millis = 10;
board.computer = 1;
board.onAddMove = () => {
  const moveList = selMoveList();
  const counter: number = board.pos.mvList.length >> 1;
  const space = counter > 99 ? "    " : "   ";
  const text =
    (board.pos.sdPlayer === 0
      ? space
      : (`${(counter > 9 ? "" : " ") + counter}.`)) + move2Iccs(board.mvLast);
  const value = `${board.mvLast}`;

  const moveItem = document.createElement("li");
  moveItem.className = "move-item";
  moveItem.dataset.value = value;
  moveItem.dataset.index = `${moveList.children.length}`;
  moveItem.innerHTML = text.replace(" ", "&nbsp;");
  moveItem.onclick = handleMoveClick;

  if (moveList.children.length > 0) {
    moveList.children[moveList.children.length - 1].classList.remove('selected');
  }
  moveItem.classList.add('selected');
  moveList.appendChild(moveItem);
  moveList.scrollTop = moveList.scrollHeight;
};
