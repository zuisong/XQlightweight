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
    <div>
      <div style="text-align:center;font-size:28px;font-family:黑体,serif">
        象棋小巫师
      </div>
      <div style="height:16px" />
      <div style="display: flex;">
        <div style="text-align:center;white-space:nowrap">
        </div>
        <span class="td" style="margin-right:10px">
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
        </span>
        <span class="td" style="vertical-align:top;width:120px;">
          <div style="text-align:left">
            <div class="label">谁先走</div>
            <div>
              <select id="selMoveMode" size={3}>
                <option selected value="0">我先走</option>
                <option value="1">电脑先走</option>
                <option value="2">不用电脑</option>
              </select>
            </div>
            <div class="label">先走让子</div>
            <div>
              <select id="selHandicap" style="padding:0">
                <option selected value="0">不让子</option>
                <option value="1">让左马</option>
                <option value="2">让双马</option>
                <option value="3">让九子</option>
              </select>
            </div>
            <div style="padding-top:2px">
              <input
                type="button"
                class="button"
                value="重新开始"
                onClick={restart_click}
              />
            </div>
            <div style="padding-top:2px">
              <input
                type="button"
                class="button"
                value="悔棋"
                onClick={retract_click}
              />
            </div>
            <div style="height:12px" />
            <div class="label">电脑水平</div>
            <div>
              <select id="selLevel" size={3} onChange={level_change}>
                <option selected value="0">入门</option>
                <option value="1">业余</option>
                <option value="2">专业</option>
              </select>
            </div>
            <div style="height:12px" />
            <div>
              <input
                type="checkbox"
                class="checkbox"
                id="chkAnimated"
                checked
                onClick={(e) => {board.animated = e.currentTarget.checked}}
              />
              <label for="chkAnimated">动画</label>
            </div>
            <div>
              <input
                type="checkbox"
                class="checkbox"
                id="chkSound"
                checked
                onClick={(e) => board.setSound(e.currentTarget.checked)}
              />
              <label for="chkSound">音效</label>
            </div>
            <div style="height:60px" />
            <div class="label">步骤</div>
            <div>
              <select
                id="selMoveList"
                size={10}
                style="font-family:宋体,serif"
                onChange={moveList_change}
              >
                <option selected value="0">=== 开始 ===</option>
              </select>
            </div>
          </div>
        </span>
      </div>
    </div>
  );
}

render(App(), document.body!);

const container = document.getElementById("container")!;

const board = new Board(container, "images/", "sounds/");
window.board = board;
board.setSearch(16);
board.millis = 10;
board.computer = 1;
board.onAddMove = () => {
  const counter: number = board.pos.mvList.length >> 1;
  const space = counter > 99 ? "    " : "   ";
  const text =
    (board.pos.sdPlayer === 0
      ? space
      : (`${(counter > 9 ? "" : " ") + counter}.`)) + move2Iccs(board.mvLast);
  const value = `${board.mvLast}`;
  selMoveList().add(createOption(text, value));
  selMoveList().scrollTop = selMoveList().scrollHeight;
};
