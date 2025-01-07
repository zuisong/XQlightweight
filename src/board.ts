/*
board.js - Source Code for XiangQi Wizard Light, Part IV

XiangQi Wizard Light - a Chinese Chess Program for JavaScript
Designed by Morning Yellow, Version: 1.0, Last Modified: Sep. 2012
Copyright (C) 2004-2012 www.xqbase.com

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
import {
  DST,
  FILE_X, IN_BOARD,
  MOVE,
  PIECE_KING,
  Position,
  RANK_Y, SIDE_TAG, SQUARE_FLIP,
  SRC,
  WIN_VALUE
} from "./position.ts";
import { LIMIT_DEPTH, Search } from "./search.ts";


export const RESULT_UNKNOWN = 0;
const RESULT_WIN = 1;
const RESULT_DRAW = 2;
const RESULT_LOSS = 3;

const BOARD_WIDTH = 521;
const BOARD_HEIGHT = 577;
const SQUARE_SIZE = 57;
const SQUARE_LEFT = (BOARD_WIDTH - SQUARE_SIZE * 9) >> 1;
const SQUARE_TOP = (BOARD_HEIGHT - SQUARE_SIZE * 10) >> 1;
const THINKING_SIZE = 32;
export const THINKING_LEFT = (BOARD_WIDTH - THINKING_SIZE) >> 1;
export const THINKING_TOP = (BOARD_HEIGHT - THINKING_SIZE) >> 1;
const MAX_STEP = 8;
const PIECE_NAME: (string | null)[] = [
  "oo", null, null, null, null, null, null, null,
  "rk", "ra", "rb", "rn", "rr", "rc", "rp", null,
  "bk", "ba", "bb", "bn", "br", "bc", "bp", null,
];

export function SQ_X(sq: number) {
  return SQUARE_LEFT + (FILE_X(sq) - 3) * SQUARE_SIZE;
}

export function SQ_Y(sq: number) {
  return SQUARE_TOP + (RANK_Y(sq) - 3) * SQUARE_SIZE;
}

export function MOVE_PX(src: number, dst: number, step: number) {
  return `${Math.floor((src * step + dst * (MAX_STEP - step)) / MAX_STEP + .5)}px`;
}

export function alertDelay(message: string) {
  setTimeout(() => {
    alert(message);
  }, 250);
}

export class Board {
  images: string
  sounds: string
  pos = new Position();
  animated = true;
  sound = true;
  search: Search | null = null;
  imgSquares: (HTMLImageElement | null)[] = [];
  sqSelected = 0;
  mvLast = 0;
  millis = 0;
  computer = -1;
  result = RESULT_UNKNOWN;
  busy = false;

  onAddMove: (() => void) | undefined = undefined

  constructor(container: HTMLElement, images: string, sounds: string) {
    this.images = images;
    this.sounds = sounds;
    this.pos = new Position();
    this.pos.fromFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");
    this.animated = true;
    this.sound = true;
    this.search = null;
    this.imgSquares = [];
    this.sqSelected = 0;
    this.mvLast = 0;
    this.millis = 0;
    this.computer = -1;
    this.result = RESULT_UNKNOWN;
    this.busy = false;

    const style = container.style;
    style.position = "relative";
    style.width = `${BOARD_WIDTH}px`;
    style.height = `${BOARD_HEIGHT}px`;
    style.background = `url(${images}board.jpg) no-repeat`;
    for (let sq = 0; sq < 256; sq++) {
      if (!IN_BOARD(sq)) {
        this.imgSquares.push(null);
        continue;
      }
      const img = document.createElement("img");
      const style = img.style;
      style.position = "absolute";
      style.left = `${SQ_X(sq)}px`;
      style.top = `${SQ_Y(sq)}px`;
      style.width = `${SQUARE_SIZE}px`;
      style.height = `${SQUARE_SIZE}px`;
      style.zIndex = "0";
      img.onmousedown = () => this.clickSquare(sq)

      container.appendChild(img);
      this.imgSquares.push(img);
    }

    this.flushBoard();
  }


  playSound(soundFile: string) {
    if (!this.sound) {
      return;
    }
    new Audio(`${this.sounds + soundFile}.wav`).play();
  }

  setSearch(hashLevel: number) {
    this.search = hashLevel === 0 ? null : new Search(this.pos, hashLevel);
  }

  flipped(sq: number) {
    return this.computer === 0 ? SQUARE_FLIP(sq) : sq;
  }

  computerMove() {
    return this.pos.sdPlayer === this.computer;
  }

  computerLastMove() {
    return 1 - this.pos.sdPlayer === this.computer;
  }

  addMove(mv: number, computerMove: boolean) {
    if (!this.pos.legalMove(mv)) {
      return;
    }
    if (!this.pos.makeMove(mv)) {
      this.playSound("illegal");
      return;
    }
    this.busy = true;
    if (!this.animated) {
      this.postAddMove(mv, computerMove);
      return;
    }

    const sqSrc = this.flipped(SRC(mv));
    const xSrc = SQ_X(sqSrc);
    const ySrc = SQ_Y(sqSrc);
    const sqDst = this.flipped(DST(mv));
    const xDst = SQ_X(sqDst);
    const yDst = SQ_Y(sqDst);
    const style = this.imgSquares[sqSrc]!.style;
    style.zIndex = '256';
    let step = MAX_STEP - 1;
    const timer = setInterval(() => {
      if (step === 0) {
        clearInterval(timer);
        style.left = `${xSrc}px`;
        style.top = `${ySrc}px`;
        style.zIndex = '0';
        this.postAddMove(mv, computerMove);
      } else {
        style.left = MOVE_PX(xSrc, xDst, step);
        style.top = MOVE_PX(ySrc, yDst, step);
        step--;
      }
    }, 16);
  }

  postAddMove(mv: number, computerMove: boolean) {
    if (this.mvLast > 0) {
      this.drawSquare(SRC(this.mvLast), false);
      this.drawSquare(DST(this.mvLast), false);
    }
    this.drawSquare(SRC(mv), true);
    this.drawSquare(DST(mv), true);
    this.sqSelected = 0;
    this.mvLast = mv;

    if (this.pos.isMate()) {
      this.playSound(computerMove ? "loss" : "win");
      this.result = computerMove ? RESULT_LOSS : RESULT_WIN;

      const pc = SIDE_TAG(this.pos.sdPlayer) + PIECE_KING;
      let sqMate = 0;
      for (let sq = 0; sq < 256; sq++) {
        if (this.pos.squares[sq] === pc) {
          sqMate = sq;
          break;
        }
      }
      if (!this.animated || sqMate === 0) {
        this.postMate(computerMove);
        return;
      }

      sqMate = this.flipped(sqMate);
      const style = this.imgSquares[sqMate]!.style;
      style.zIndex = '256';
      const xMate = SQ_X(sqMate);
      let step = MAX_STEP;
      const timer = setInterval(() => {
        if (step === 0) {
          clearInterval(timer);
          style.left = `${xMate}px`;
          style.zIndex = '0';
          this.imgSquares[sqMate]!.src = `${this.images +
            (this.pos.sdPlayer === 0 ? "r" : "b")}km.gif`;
          this.postMate(computerMove);
        } else {
          style.left = `${xMate + ((step & 1) === 0 ? step : -step) * 2}px`;
          step--;
        }
      }, 50);
      return;
    }

    let vlRep = this.pos.repStatus(3);
    if (vlRep > 0) {
      vlRep = this.pos.repValue(vlRep);
      if (vlRep > -WIN_VALUE && vlRep < WIN_VALUE) {
        this.playSound("draw");
        this.result = RESULT_DRAW;
        alertDelay("双方不变作和，辛苦了！");
      } else if (computerMove === (vlRep < 0)) {
        this.playSound("loss");
        this.result = RESULT_LOSS;
        alertDelay("长打作负，请不要气馁！");
      } else {
        this.playSound("win");
        this.result = RESULT_WIN;
        alertDelay("长打作负，祝贺你取得胜利！");
      }
      this.postAddMove2();
      this.busy = false;
      return;
    }

    if (this.pos.captured()) {
      let hasMaterial = false;
      for (let sq = 0; sq < 256; sq++) {
        if (IN_BOARD(sq) && (this.pos.squares[sq] & 7) > 2) {
          hasMaterial = true;
          break;
        }
      }
      if (!hasMaterial) {
        this.playSound("draw");
        this.result = RESULT_DRAW;
        alertDelay("双方都没有进攻棋子了，辛苦了！");
        this.postAddMove2();
        this.busy = false;
        return;
      }
    } else if (this.pos.pcList.length > 100) {
      let captured = false;
      for (let i = 2; i <= 100; i++) {
        if (this.pos.pcList[this.pos.pcList.length - i] > 0) {
          captured = true;
          break;
        }
      }
      if (!captured) {
        this.playSound("draw");
        this.result = RESULT_DRAW;
        alertDelay("超过自然限着作和，辛苦了！");
        this.postAddMove2();
        this.busy = false;
        return;
      }
    }

    if (this.pos.inCheck()) {
      this.playSound(computerMove ? "check2" : "check");
    } else if (this.pos.captured()) {
      this.playSound(computerMove ? "capture2" : "capture");
    } else {
      this.playSound(computerMove ? "move2" : "move");
    }

    this.postAddMove2();
    this.response();
  }

  postAddMove2() {
    if (typeof this.onAddMove === "function") {
      this.onAddMove();
    }
  }

  postMate(computerMove: boolean) {
    alertDelay(computerMove ? "请再接再厉！" : "祝贺你取得胜利！");
    this.postAddMove2();
    this.busy = false;
  }

  response() {
    if (this.search == null || !this.computerMove()) {
      this.busy = false;
      return;
    }
    const thinking = document.getElementById("thinking")!
    thinking.style.visibility = "visible";
    this.busy = true;
    setTimeout(() => {
      this.addMove(this.search!.searchMain(LIMIT_DEPTH, this.millis as number), true);
      thinking.style.visibility = "hidden";
    }, 250);
  }

  clickSquare(sq_: number) {
    if (this.busy || this.result !== RESULT_UNKNOWN) {
      return;
    }
    const sq = this.flipped(sq_);
    const pc = this.pos.squares[sq];
    if ((pc & SIDE_TAG(this.pos.sdPlayer)) !== 0) {
      this.playSound("click");
      if (this.mvLast !== 0) {
        this.drawSquare(SRC(this.mvLast), false);
        this.drawSquare(DST(this.mvLast), false);
      }
      if (this.sqSelected) {
        this.drawSquare(this.sqSelected, false);
      }
      this.drawSquare(sq, true);
      this.sqSelected = sq;
    } else if (this.sqSelected > 0) {
      this.addMove(MOVE(this.sqSelected, sq), false);
    }
  }

  drawSquare(sq: number, selected: boolean) {
    const img = this.imgSquares[this.flipped(sq)]!;
    img.src = `${this.images + PIECE_NAME[this.pos.squares[sq]]}.gif`;
    img.style.backgroundImage = selected ? `url(${this.images}oos.gif)` : "";
  }

  flushBoard() {
    this.mvLast = this.pos.mvList[this.pos.mvList.length - 1];
    for (let sq = 0; sq < 256; sq++) {
      if (IN_BOARD(sq)) {
        this.drawSquare(sq, sq === SRC(this.mvLast) || sq === DST(this.mvLast));
      }
    }
  }

  restart(fen: string) {
    if (this.busy) {
      return;
    }
    this.result = RESULT_UNKNOWN;
    this.pos.fromFen(fen);
    this.flushBoard();
    this.playSound("newgame");
    this.response();
  }

  retract() {
    if (this.busy) {
      return;
    }
    this.result = RESULT_UNKNOWN;
    if (this.pos.mvList.length > 1) {
      this.pos.undoMakeMove();
    }
    if (this.pos.mvList.length > 1 && this.computerMove()) {
      this.pos.undoMakeMove();
    }
    this.flushBoard();
    this.response();
  }

  setSound(sound: boolean) {
    this.sound = sound;
    if (sound) {
      this.playSound("click");
    }
  }
}
