// deno-lint-ignore-file no-case-declarations no-fallthrough
/*
position.js - Source Code for XiangQi Wizard Light, Part I

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

import { BOOK_DAT } from "./book.ts";



export function binarySearch(vlss: number[][], vl: number) {
  let low = 0;
  let high = vlss.length - 1;
  while (low <= high) {
    let mid = (low + high) >> 1;
    if (vlss[mid][0] < vl) {
      low = mid + 1;
    } else if (vlss[mid][0] > vl) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  return -1;
}

let MATE_VALUE = 10000;
let BAN_VALUE = MATE_VALUE - 100;
let WIN_VALUE = MATE_VALUE - 200;
let NULL_SAFE_MARGIN = 400;
let NULL_OKAY_MARGIN = 200;
let DRAW_VALUE = 20;
let ADVANCED_VALUE = 3;

export let PIECE_KING = 0;
export let PIECE_ADVISOR = 1;
export let PIECE_BISHOP = 2;
export let PIECE_KNIGHT = 3;
export let PIECE_ROOK = 4;
export let PIECE_CANNON = 5;
export let PIECE_PAWN = 6;

export let RANK_TOP = 3;
export let RANK_BOTTOM = 12;
export let FILE_LEFT = 3;
export let FILE_RIGHT = 11;

export let ADD_PIECE = false;
export let DEL_PIECE = true;

let IN_BOARD_ = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

let IN_FORT_ = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

let LEGAL_SPAN = [
  0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0,
];

let KNIGHT_PIN_ = [
  0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, -16, 0, -16, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 16, 0, 16, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0,
];

let KING_DELTA = [-16, -1, 1, 16];
let ADVISOR_DELTA = [-17, -15, 15, 17];
let KNIGHT_DELTA = [[-33, -31], [-18, 14], [-14, 18], [31, 33]];
let KNIGHT_CHECK_DELTA = [[-33, -18], [-31, -14], [14, 31], [18, 33]];
let MVV_VALUE = [50, 10, 10, 30, 40, 30, 20, 0];

let PIECE_VALUE = [
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 11, 13, 11, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 19, 24, 34, 42, 44, 42, 34, 24, 19, 0, 0, 0, 0,
    0, 0, 0, 19, 24, 32, 37, 37, 37, 32, 24, 19, 0, 0, 0, 0,
    0, 0, 0, 19, 23, 27, 29, 30, 29, 27, 23, 19, 0, 0, 0, 0,
    0, 0, 0, 14, 18, 20, 27, 29, 27, 20, 18, 14, 0, 0, 0, 0,
    0, 0, 0, 7, 0, 13, 0, 16, 0, 13, 0, 7, 0, 0, 0, 0,
    0, 0, 0, 7, 0, 7, 0, 15, 0, 7, 0, 7, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 11, 15, 11, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 20, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 18, 0, 0, 20, 23, 20, 0, 0, 18, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 20, 20, 0, 20, 20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 20, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 18, 0, 0, 20, 23, 20, 0, 0, 18, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 20, 20, 0, 20, 20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 90, 90, 90, 96, 90, 96, 90, 90, 90, 0, 0, 0, 0,
    0, 0, 0, 90, 96, 103, 97, 94, 97, 103, 96, 90, 0, 0, 0, 0,
    0, 0, 0, 92, 98, 99, 103, 99, 103, 99, 98, 92, 0, 0, 0, 0,
    0, 0, 0, 93, 108, 100, 107, 100, 107, 100, 108, 93, 0, 0, 0, 0,
    0, 0, 0, 90, 100, 99, 103, 104, 103, 99, 100, 90, 0, 0, 0, 0,
    0, 0, 0, 90, 98, 101, 102, 103, 102, 101, 98, 90, 0, 0, 0, 0,
    0, 0, 0, 92, 94, 98, 95, 98, 95, 98, 94, 92, 0, 0, 0, 0,
    0, 0, 0, 93, 92, 94, 95, 92, 95, 94, 92, 93, 0, 0, 0, 0,
    0, 0, 0, 85, 90, 92, 93, 78, 93, 92, 90, 85, 0, 0, 0, 0,
    0, 0, 0, 88, 85, 90, 88, 90, 88, 90, 85, 88, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 206, 208, 207, 213, 214, 213, 207, 208, 206, 0, 0, 0, 0,
    0, 0, 0, 206, 212, 209, 216, 233, 216, 209, 212, 206, 0, 0, 0, 0,
    0, 0, 0, 206, 208, 207, 214, 216, 214, 207, 208, 206, 0, 0, 0, 0,
    0, 0, 0, 206, 213, 213, 216, 216, 216, 213, 213, 206, 0, 0, 0, 0,
    0, 0, 0, 208, 211, 211, 214, 215, 214, 211, 211, 208, 0, 0, 0, 0,
    0, 0, 0, 208, 212, 212, 214, 215, 214, 212, 212, 208, 0, 0, 0, 0,
    0, 0, 0, 204, 209, 204, 212, 214, 212, 204, 209, 204, 0, 0, 0, 0,
    0, 0, 0, 198, 208, 204, 212, 212, 212, 204, 208, 198, 0, 0, 0, 0,
    0, 0, 0, 200, 208, 206, 212, 200, 212, 206, 208, 200, 0, 0, 0, 0,
    0, 0, 0, 194, 206, 204, 212, 200, 212, 204, 206, 194, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 100, 100, 96, 91, 90, 91, 96, 100, 100, 0, 0, 0, 0,
    0, 0, 0, 98, 98, 96, 92, 89, 92, 96, 98, 98, 0, 0, 0, 0,
    0, 0, 0, 97, 97, 96, 91, 92, 91, 96, 97, 97, 0, 0, 0, 0,
    0, 0, 0, 96, 99, 99, 98, 100, 98, 99, 99, 96, 0, 0, 0, 0,
    0, 0, 0, 96, 96, 96, 96, 100, 96, 96, 96, 96, 0, 0, 0, 0,
    0, 0, 0, 95, 96, 99, 96, 100, 96, 99, 96, 95, 0, 0, 0, 0,
    0, 0, 0, 96, 96, 96, 96, 96, 96, 96, 96, 96, 0, 0, 0, 0,
    0, 0, 0, 97, 96, 100, 99, 101, 99, 100, 96, 97, 0, 0, 0, 0,
    0, 0, 0, 96, 97, 98, 98, 98, 98, 98, 97, 96, 0, 0, 0, 0,
    0, 0, 0, 96, 96, 97, 99, 99, 99, 97, 96, 96, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 11, 13, 11, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 19, 24, 34, 42, 44, 42, 34, 24, 19, 0, 0, 0, 0,
    0, 0, 0, 19, 24, 32, 37, 37, 37, 32, 24, 19, 0, 0, 0, 0,
    0, 0, 0, 19, 23, 27, 29, 30, 29, 27, 23, 19, 0, 0, 0, 0,
    0, 0, 0, 14, 18, 20, 27, 29, 27, 20, 18, 14, 0, 0, 0, 0,
    0, 0, 0, 7, 0, 13, 0, 16, 0, 13, 0, 7, 0, 0, 0, 0,
    0, 0, 0, 7, 0, 7, 0, 15, 0, 7, 0, 7, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 11, 15, 11, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
];

export function IN_BOARD(sq: number) {
  return IN_BOARD_[sq] != 0;
}

export function IN_FORT(sq: number) {
  return IN_FORT_[sq] != 0;
}

export function RANK_Y(sq: number) {
  return sq >> 4;
}

export function FILE_X(sq: number) {
  return sq & 15;
}

export function COORD_XY(x: number, y: number) {
  return x + (y << 4);
}

export function SQUARE_FLIP(sq: number) {
  return 254 - sq;
}

export function FILE_FLIP(x: number) {
  return 14 - x;
}

export function RANK_FLIP(y: number) {
  return 15 - y;
}

export function MIRROR_SQUARE(sq: number) {
  return COORD_XY(FILE_FLIP(FILE_X(sq)), RANK_Y(sq));
}

export function SQUARE_FORWARD(sq: number, sd: number) {
  return sq - 16 + (sd << 5);
}

export function KING_SPAN(sqSrc: number, sqDst: number) {
  return LEGAL_SPAN[sqDst - sqSrc + 256] == 1;
}

export function ADVISOR_SPAN(sqSrc: number, sqDst: number) {
  return LEGAL_SPAN[sqDst - sqSrc + 256] == 2;
}

export function BISHOP_SPAN(sqSrc: number, sqDst: number) {
  return LEGAL_SPAN[sqDst - sqSrc + 256] == 3;
}

export function BISHOP_PIN(sqSrc: number, sqDst: number) {
  return (sqSrc + sqDst) >> 1;
}

export function KNIGHT_PIN(sqSrc: number, sqDst: number) {
  return sqSrc + KNIGHT_PIN_[sqDst - sqSrc + 256];
}

export function HOME_HALF(sq: number, sd: number) {
  return (sq & 0x80) != (sd << 7);
}

export function AWAY_HALF(sq: number, sd: number) {
  return (sq & 0x80) == (sd << 7);
}

export function SAME_HALF(sqSrc: number, sqDst: number) {
  return ((sqSrc ^ sqDst) & 0x80) == 0;
}

export function SAME_RANK(sqSrc: number, sqDst: number) {
  return ((sqSrc ^ sqDst) & 0xf0) == 0;
}

export function SAME_FILE(sqSrc: number, sqDst: number) {
  return ((sqSrc ^ sqDst) & 0x0f) == 0;
}

export function SIDE_TAG(sd: number) {
  return 8 + (sd << 3);
}

export function OPP_SIDE_TAG(sd: number) {
  return 16 - (sd << 3);
}

export function SRC(mv: number) {
  return mv & 255;
}

export function DST(mv: number) {
  return mv >> 8;
}

export function MOVE(sqSrc: number, sqDst: number) {
  return sqSrc + (sqDst << 8);
}

export function MIRROR_MOVE(mv: number) {
  return MOVE(MIRROR_SQUARE(SRC(mv)), MIRROR_SQUARE(DST(mv)));
}

export function MVV_LVA(pc: number, lva: number) {
  return MVV_VALUE[pc & 7] - lva;
}

export function CHR(n: number) {
  return String.fromCharCode(n);
}

export function ASC(c: string) {
  return c.charCodeAt(0);
}

let FEN_PIECE = "        KABNRCP kabnrcp ";

export function CHAR_TO_PIECE(c: string) {
  switch (c) {
    case "K":
      return PIECE_KING;
    case "A":
      return PIECE_ADVISOR;
    case "B":
    case "E":
      return PIECE_BISHOP;
    case "H":
    case "N":
      return PIECE_KNIGHT;
    case "R":
      return PIECE_ROOK;
    case "C":
      return PIECE_CANNON;
    case "P":
      return PIECE_PAWN;
    default:
      return -1;
  }
}

class RC4 {
  x: number
  y: number
  state: number[]
  constructor(key: number[]) {
    this.x = this.y = 0;
    this.state = [];
    for (let i = 0; i < 256; i++) {
      this.state.push(i);
    }
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + this.state[i] + key[i % key.length]) & 0xff;
      this.swap(i, j);
    }
  }


  swap(i: number, j: number) {
    let t = this.state[i];
    this.state[i] = this.state[j];
    this.state[j] = t;
  }

  nextByte() {
    this.x = (this.x + 1) & 0xff;
    this.y = (this.y + this.state[this.x]) & 0xff;
    this.swap(this.x, this.y);
    let t = (this.state[this.x] + this.state[this.y]) & 0xff;
    return this.state[t];
  }
  nextLong() {
    let n0 = this.nextByte();
    let n1 = this.nextByte();
    let n2 = this.nextByte();
    let n3 = this.nextByte();
    return n0 + (n1 << 8) + (n2 << 16) + ((n3 << 24) & 0xffffffff);
  }
}

let PreGen_zobristKeyPlayer: number, PreGen_zobristLockPlayer: number;
let PreGen_zobristKeyTable: number[][] = [], PreGen_zobristLockTable: number[][] = [];

let rc4 = new RC4([0]);
PreGen_zobristKeyPlayer = rc4.nextLong();
rc4.nextLong();
PreGen_zobristLockPlayer = rc4.nextLong();
for (let i = 0; i < 14; i++) {
  let keys: number[] = [];
  let locks = [];
  for (let j = 0; j < 256; j++) {
    keys.push(rc4.nextLong());
    rc4.nextLong();
    locks.push(rc4.nextLong());
  }
  PreGen_zobristKeyTable.push(keys);
  PreGen_zobristLockTable.push(locks);
}

class Position {
  sdPlayer: number = 0
  squares: number[] = []
  zobristKey: number = 0
  zobristLock: number = 0
  vlWhite: number = 0
  vlBlack: number = 0

  mvList = [0];
  pcList = [0];
  keyList = [0];
  chkList: boolean[] = [false];
  distance = 0;



  // export function Position() {
  // sdPlayer, zobristKey, zobristLock, vlWhite, vlBlack, distance;
  // squares, mvList, pcList, keyList, chkList;
  // }

  clearBoard() {
    this.sdPlayer = 0;
    this.squares = [];
    for (let sq = 0; sq < 256; sq++) {
      this.squares.push(0);
    }
    this.zobristKey = this.zobristLock = 0;
    this.vlWhite = this.vlBlack = 0;
  };

  setIrrev() {
    this.mvList = [0];
    this.pcList = [0];
    this.keyList = [0];
    this.chkList = [this.checked()];
    this.distance = 0;
  }

  addPiece(sq: number, pc: number, bDel: any = undefined) {
    let pcAdjust;
    this.squares[sq] = bDel ? 0 : pc;
    if (pc < 16) {
      pcAdjust = pc - 8;
      this.vlWhite += bDel ? -PIECE_VALUE[pcAdjust][sq] :
        PIECE_VALUE[pcAdjust][sq];
    } else {
      pcAdjust = pc - 16;
      this.vlBlack += bDel ? -PIECE_VALUE[pcAdjust][SQUARE_FLIP(sq)] :
        PIECE_VALUE[pcAdjust][SQUARE_FLIP(sq)];
      pcAdjust += 7;
    }
    this.zobristKey ^= PreGen_zobristKeyTable[pcAdjust][sq];
    this.zobristLock ^= PreGen_zobristLockTable[pcAdjust][sq];
  }

  movePiece(mv: any) {
    let sqSrc = SRC(mv);
    let sqDst = DST(mv);
    let pc = this.squares[sqDst];
    this.pcList.push(pc);
    if (pc > 0) {
      this.addPiece(sqDst, pc, DEL_PIECE);
    }
    pc = this.squares[sqSrc];
    this.addPiece(sqSrc, pc, DEL_PIECE);
    this.addPiece(sqDst, pc, ADD_PIECE);
    this.mvList.push(mv);
  }

  undoMovePiece() {
    let mv = this.mvList.pop()!!;
    let sqSrc = SRC(mv);
    let sqDst = DST(mv);
    let pc = this.squares[sqDst];
    this.addPiece(sqDst, pc, DEL_PIECE);
    this.addPiece(sqSrc, pc, ADD_PIECE);
    pc = this.pcList.pop()!!;
    if (pc > 0) {
      this.addPiece(sqDst, pc, ADD_PIECE);
    }
  }

  changeSide() {
    this.sdPlayer = 1 - this.sdPlayer;
    this.zobristKey ^= PreGen_zobristKeyPlayer;
    this.zobristLock ^= PreGen_zobristLockPlayer;
  }

  makeMove(mv: any) {
    let zobristKey = this.zobristKey;
    this.movePiece(mv);
    if (this.checked()) {
      this.undoMovePiece();
      return false;
    }
    this.keyList.push(zobristKey);
    this.changeSide();
    this.chkList.push(this.checked());
    this.distance++;
    return true;
  }

  undoMakeMove() {
    this.distance--;
    this.chkList.pop();
    this.changeSide();
    this.keyList.pop();
    this.undoMovePiece();
  }

  nullMove() {
    this.mvList.push(0);
    this.pcList.push(0);
    this.keyList.push(this.zobristKey);
    this.changeSide();
    this.chkList.push(false);
    this.distance++;
  }

  undoNullMove() {
    this.distance--;
    this.chkList.pop();
    this.changeSide();
    this.keyList.pop();
    this.pcList.pop();
    this.mvList.pop();
  }

  fromFen(fen: string) {
    this.clearBoard();
    let y = RANK_TOP;
    let x = FILE_LEFT;
    let index = 0;
    if (index == fen.length) {
      this.setIrrev();
      return;
    }
    let c = fen.charAt(index);
    while (c != " ") {
      if (c == "/") {
        x = FILE_LEFT;
        y++;
        if (y > RANK_BOTTOM) {
          break;
        }
      } else if (c >= "1" && c <= "9") {
        x += (ASC(c) - ASC("0"));
      } else if (c >= "A" && c <= "Z") {
        if (x <= FILE_RIGHT) {
          let pt = CHAR_TO_PIECE(c);
          if (pt >= 0) {
            this.addPiece(COORD_XY(x, y), pt + 8);
          }
          x++;
        }
      } else if (c >= "a" && c <= "z") {
        if (x <= FILE_RIGHT) {
          let pt = CHAR_TO_PIECE(CHR(ASC(c) + ASC("A") - ASC("a")));
          if (pt >= 0) {
            this.addPiece(COORD_XY(x, y), pt + 16);
          }
          x++;
        }
      }
      index++;
      if (index == fen.length) {
        this.setIrrev();
        return;
      }
      c = fen.charAt(index);
    }
    index++;
    if (index == fen.length) {
      this.setIrrev();
      return;
    }
    if (this.sdPlayer == (fen.charAt(index) == "b" ? 0 : 1)) {
      this.changeSide();
    }
    this.setIrrev();
  }

  toFen() {
    let fen = "";
    for (let y = RANK_TOP; y <= RANK_BOTTOM; y++) {
      let k = 0;
      for (let x = FILE_LEFT; x <= FILE_RIGHT; x++) {
        let pc = this.squares[COORD_XY(x, y)];
        if (pc > 0) {
          if (k > 0) {
            fen += CHR(ASC("0") + k);
            k = 0;
          }
          fen += FEN_PIECE.charAt(pc);
        } else {
          k++;
        }
      }
      if (k > 0) {
        fen += CHR(ASC("0") + k);
      }
      fen += "/";
    }
    return fen.substring(0, fen.length - 1) +
      (this.sdPlayer == 0 ? " w" : " b");
  }

  generateMoves(vls: number[] | null) {
    let mvs = [];
    let pcSelfSide = SIDE_TAG(this.sdPlayer);
    let pcOppSide = OPP_SIDE_TAG(this.sdPlayer);
    for (let sqSrc = 0; sqSrc < 256; sqSrc++) {
      let pcSrc = this.squares[sqSrc];
      if ((pcSrc & pcSelfSide) == 0) {
        continue;
      }
      switch (pcSrc - pcSelfSide) {
        case PIECE_KING:
          for (let i = 0; i < 4; i++) {
            let sqDst = sqSrc + KING_DELTA[i];
            if (!IN_FORT(sqDst)) {
              continue;
            }
            let pcDst = this.squares[sqDst];
            if (vls == null) {
              if ((pcDst & pcSelfSide) == 0) {
                mvs.push(MOVE(sqSrc, sqDst));
              }
            } else if ((pcDst & pcOppSide) != 0) {
              mvs.push(MOVE(sqSrc, sqDst));
              vls.push(MVV_LVA(pcDst, 5));
            }
          }
          break;
        case PIECE_ADVISOR:
          for (let i = 0; i < 4; i++) {
            let sqDst = sqSrc + ADVISOR_DELTA[i];
            if (!IN_FORT(sqDst)) {
              continue;
            }
            let pcDst = this.squares[sqDst];
            if (vls == null) {
              if ((pcDst & pcSelfSide) == 0) {
                mvs.push(MOVE(sqSrc, sqDst));
              }
            } else if ((pcDst & pcOppSide) != 0) {
              mvs.push(MOVE(sqSrc, sqDst));
              vls.push(MVV_LVA(pcDst, 1));
            }
          }
          break;
        case PIECE_BISHOP:
          for (let i = 0; i < 4; i++) {
            let sqDst = sqSrc + ADVISOR_DELTA[i];
            if (!(IN_BOARD(sqDst) && HOME_HALF(sqDst, this.sdPlayer) &&
              this.squares[sqDst] == 0)) {
              continue;
            }
            sqDst += ADVISOR_DELTA[i];
            let pcDst = this.squares[sqDst];
            if (vls == null) {
              if ((pcDst & pcSelfSide) == 0) {
                mvs.push(MOVE(sqSrc, sqDst));
              }
            } else if ((pcDst & pcOppSide) != 0) {
              mvs.push(MOVE(sqSrc, sqDst));
              vls.push(MVV_LVA(pcDst, 1));
            }
          }
          break;
        case PIECE_KNIGHT:
          for (let i = 0; i < 4; i++) {
            let sqDst = sqSrc + KING_DELTA[i];
            if (this.squares[sqDst] > 0) {
              continue;
            }
            for (let j = 0; j < 2; j++) {
              sqDst = sqSrc + KNIGHT_DELTA[i][j];
              if (!IN_BOARD(sqDst)) {
                continue;
              }
              let pcDst = this.squares[sqDst];
              if (vls == null) {
                if ((pcDst & pcSelfSide) == 0) {
                  mvs.push(MOVE(sqSrc, sqDst));
                }
              } else if ((pcDst & pcOppSide) != 0) {
                mvs.push(MOVE(sqSrc, sqDst));
                vls.push(MVV_LVA(pcDst, 1));
              }
            }
          }
          break;
        case PIECE_ROOK:
          for (let i = 0; i < 4; i++) {
            let delta = KING_DELTA[i];
            let sqDst = sqSrc + delta;
            while (IN_BOARD(sqDst)) {
              let pcDst = this.squares[sqDst];
              if (pcDst == 0) {
                if (vls == null) {
                  mvs.push(MOVE(sqSrc, sqDst));
                }
              } else {
                if ((pcDst & pcOppSide) != 0) {
                  mvs.push(MOVE(sqSrc, sqDst));
                  if (vls != null) {
                    vls.push(MVV_LVA(pcDst, 4));
                  }
                }
                break;
              }
              sqDst += delta;
            }
          }
          break;
        case PIECE_CANNON:
          for (let i = 0; i < 4; i++) {
            let delta = KING_DELTA[i];
            let sqDst = sqSrc + delta;
            while (IN_BOARD(sqDst)) {
              let pcDst = this.squares[sqDst];
              if (pcDst == 0) {
                if (vls == null) {
                  mvs.push(MOVE(sqSrc, sqDst));
                }
              } else {
                break;
              }
              sqDst += delta;
            }
            sqDst += delta;
            while (IN_BOARD(sqDst)) {
              let pcDst = this.squares[sqDst];
              if (pcDst > 0) {
                if ((pcDst & pcOppSide) != 0) {
                  mvs.push(MOVE(sqSrc, sqDst));
                  if (vls != null) {
                    vls.push(MVV_LVA(pcDst, 4));
                  }
                }
                break;
              }
              sqDst += delta;
            }
          }
          break;
        case PIECE_PAWN:
          let sqDst = SQUARE_FORWARD(sqSrc, this.sdPlayer);
          if (IN_BOARD(sqDst)) {
            let pcDst = this.squares[sqDst];
            if (vls == null) {
              if ((pcDst & pcSelfSide) == 0) {
                mvs.push(MOVE(sqSrc, sqDst));
              }
            } else if ((pcDst & pcOppSide) != 0) {
              mvs.push(MOVE(sqSrc, sqDst));
              vls.push(MVV_LVA(pcDst, 2));
            }
          }
          if (AWAY_HALF(sqSrc, this.sdPlayer)) {
            for (let delta = -1; delta <= 1; delta += 2) {
              sqDst = sqSrc + delta;
              if (IN_BOARD(sqDst)) {
                let pcDst = this.squares[sqDst];
                if (vls == null) {
                  if ((pcDst & pcSelfSide) == 0) {
                    mvs.push(MOVE(sqSrc, sqDst));
                  }
                } else if ((pcDst & pcOppSide) != 0) {
                  mvs.push(MOVE(sqSrc, sqDst));
                  vls.push(MVV_LVA(pcDst, 2));
                }
              }
            }
          }
          break;
      }
    }
    return mvs;
  }

  legalMove(mv: any) {
    let sqSrc = SRC(mv);
    let pcSrc = this.squares[sqSrc];
    let pcSelfSide = SIDE_TAG(this.sdPlayer);
    if ((pcSrc & pcSelfSide) == 0) {
      return false;
    }

    let sqDst = DST(mv);
    let pcDst = this.squares[sqDst];
    if ((pcDst & pcSelfSide) != 0) {
      return false;
    }

    switch (pcSrc - pcSelfSide) {
      case PIECE_KING:
        return IN_FORT(sqDst) && KING_SPAN(sqSrc, sqDst);
      case PIECE_ADVISOR:
        return IN_FORT(sqDst) && ADVISOR_SPAN(sqSrc, sqDst);
      case PIECE_BISHOP:
        return SAME_HALF(sqSrc, sqDst) && BISHOP_SPAN(sqSrc, sqDst) &&
          this.squares[BISHOP_PIN(sqSrc, sqDst)] == 0;
      case PIECE_KNIGHT:
        const sqPin_1 = KNIGHT_PIN(sqSrc, sqDst);
        return sqPin_1 != sqSrc && this.squares[sqPin_1] == 0;
      case PIECE_ROOK:
      case PIECE_CANNON:
        let delta;
        if (SAME_RANK(sqSrc, sqDst)) {
          delta = (sqDst < sqSrc ? -1 : 1);
        } else if (SAME_FILE(sqSrc, sqDst)) {
          delta = (sqDst < sqSrc ? -16 : 16);
        } else {
          return false;
        }
        let sqPin = sqSrc + delta;
        while (sqPin != sqDst && this.squares[sqPin] == 0) {
          sqPin += delta;
        }
        if (sqPin == sqDst) {
          return pcDst == 0 || pcSrc - pcSelfSide == PIECE_ROOK;
        }
        if (pcDst == 0 || pcSrc - pcSelfSide != PIECE_CANNON) {
          return false;
        }
        sqPin += delta;
        while (sqPin != sqDst && this.squares[sqPin] == 0) {
          sqPin += delta;
        }
        return sqPin == sqDst;
      case PIECE_PAWN:
        if (AWAY_HALF(sqDst, this.sdPlayer) && (sqDst == sqSrc - 1 || sqDst == sqSrc + 1)) {
          return true;
        }
        return sqDst == SQUARE_FORWARD(sqSrc, this.sdPlayer);
      default:
        return false;
    }
  }

  checked(): boolean {
    let pcSelfSide = SIDE_TAG(this.sdPlayer);
    let pcOppSide = OPP_SIDE_TAG(this.sdPlayer);
    for (let sqSrc = 0; sqSrc < 256; sqSrc++) {
      if (this.squares[sqSrc] != pcSelfSide + PIECE_KING) {
        continue;
      }
      if (this.squares[SQUARE_FORWARD(sqSrc, this.sdPlayer)] == pcOppSide + PIECE_PAWN) {
        return true;
      }
      for (let delta = -1; delta <= 1; delta += 2) {
        if (this.squares[sqSrc + delta] == pcOppSide + PIECE_PAWN) {
          return true;
        }
      }
      for (let i = 0; i < 4; i++) {
        if (this.squares[sqSrc + ADVISOR_DELTA[i]] != 0) {
          continue;
        }
        for (let j = 0; j < 2; j++) {
          let pcDst = this.squares[sqSrc + KNIGHT_CHECK_DELTA[i][j]];
          if (pcDst == pcOppSide + PIECE_KNIGHT) {
            return true;
          }
        }
      }
      for (let i = 0; i < 4; i++) {
        let delta = KING_DELTA[i];
        let sqDst = sqSrc + delta;
        while (IN_BOARD(sqDst)) {
          let pcDst = this.squares[sqDst];
          if (pcDst > 0) {
            if (pcDst == pcOppSide + PIECE_ROOK || pcDst == pcOppSide + PIECE_KING) {
              return true;
            }
            break;
          }
          sqDst += delta;
        }
        sqDst += delta;
        while (IN_BOARD(sqDst)) {
          let pcDst = this.squares[sqDst];
          if (pcDst > 0) {
            if (pcDst == pcOppSide + PIECE_CANNON) {
              return true;
            }
            break;
          }
          sqDst += delta;
        }
      }
      return false;
    }
    return false;
  }

  isMate() {
    let mvs = this.generateMoves(null);
    for (let i = 0; i < mvs.length; i++) {
      if (this.makeMove(mvs[i])) {
        this.undoMakeMove();
        return false;
      }
    }
    return true;
  }
  mateValue() {
    return this.distance - MATE_VALUE;
  }

  banValue() {
    return this.distance - BAN_VALUE;
  }

  drawValue() {
    return (this.distance & 1) == 0 ? -DRAW_VALUE : DRAW_VALUE;
  }

  evaluate() {
    let vl = (this.sdPlayer == 0 ? this.vlWhite - this.vlBlack :
      this.vlBlack - this.vlWhite) + ADVANCED_VALUE;
    return vl == this.drawValue() ? vl - 1 : vl;
  }

  nullOkay() {
    return (this.sdPlayer == 0 ? this.vlWhite : this.vlBlack) > NULL_OKAY_MARGIN;
  }

  nullSafe() {
    return (this.sdPlayer == 0 ? this.vlWhite : this.vlBlack) > NULL_SAFE_MARGIN;
  }

  inCheck() {
    return this.chkList[this.chkList.length - 1];
  }

  captured() {
    return this.pcList[this.pcList.length - 1] > 0;
  }

  repValue(vlRep: number) {
    let vlReturn = ((vlRep & 2) == 0 ? 0 : this.banValue()) +
      ((vlRep & 4) == 0 ? 0 : -this.banValue());
    return vlReturn == 0 ? this.drawValue() : vlReturn;
  }

  repStatus(recur_: any) {
    let recur = recur_;
    let selfSide = false;
    let perpCheck = true;
    let oppPerpCheck = true;
    let index = this.mvList.length - 1;
    while (this.mvList[index] > 0 && this.pcList[index] == 0) {
      if (selfSide) {
        perpCheck = perpCheck && this.chkList[index];
        if (this.keyList[index] == this.zobristKey) {
          recur--;
          if (recur == 0) {
            return 1 + (perpCheck ? 2 : 0) + (oppPerpCheck ? 4 : 0);
          }
        }
      } else {
        oppPerpCheck = oppPerpCheck && this.chkList[index];
      }
      selfSide = !selfSide;
      index--;
    }
    return 0;
  }

  mirror() {
    let pos = new Position();
    pos.clearBoard();
    for (let sq = 0; sq < 256; sq++) {
      let pc = this.squares[sq];
      if (pc > 0) {
        pos.addPiece(MIRROR_SQUARE(sq), pc);
      }
    }
    if (this.sdPlayer == 1) {
      pos.changeSide();
    }
    return pos;
  }

  bookMove() {
    if (typeof BOOK_DAT != "object" || BOOK_DAT.length == 0) {
      return 0;
    }
    let mirror = false;
    let lock = this.zobristLock >>> 1; // Convert into Unsigned
    let index = binarySearch(BOOK_DAT, lock);
    if (index < 0) {
      mirror = true;
      lock = this.mirror().zobristLock >>> 1; // Convert into Unsigned
      index = binarySearch(BOOK_DAT, lock);
    }
    if (index < 0) {
      return 0;
    }
    index--;
    while (index >= 0 && BOOK_DAT[index][0] == lock) {
      index--;
    }
    let mvs = [], vls = [];
    let value = 0;
    index++;
    while (index < BOOK_DAT.length && BOOK_DAT[index][0] == lock) {
      let mv = BOOK_DAT[index][1];
      mv = (mirror ? MIRROR_MOVE(mv) : mv);
      if (this.legalMove(mv)) {
        mvs.push(mv);
        let vl = BOOK_DAT[index][2];
        vls.push(vl);
        value += vl;
      }
      index++;
    }
    if (value == 0) {
      return 0;
    }
    value = Math.floor(Math.random() * value);
    for (index = 0; index < mvs.length; index++) {
      value -= vls[index];
      if (value < 0) {
        break;
      }
    }
    return mvs[index];
  }

  historyIndex(mv: any) {
    return ((this.squares[SRC(mv)] - 8) << 8) + DST(mv);
  }
}
/*
search.js - Source Code for XiangQi Wizard Light, Part II

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



let SHELL_STEP = [0, 1, 4, 13, 40, 121, 364, 1093];

export function shellSort(mvs: number[], vls: number[]) {
  let stepLevel = 1;
  while (SHELL_STEP[stepLevel] < mvs.length) {
    stepLevel++;
  }
  stepLevel--;
  while (stepLevel > 0) {
    let step = SHELL_STEP[stepLevel];
    for (let i = step; i < mvs.length; i++) {
      let mvBest = mvs[i];
      let vlBest = vls[i];
      let j = i - step;
      while (j >= 0 && vlBest > vls[j]) {
        mvs[j + step] = mvs[j];
        vls[j + step] = vls[j];
        j -= step;
      }
      mvs[j + step] = mvBest;
      vls[j + step] = vlBest;
    }
    stepLevel--;
  }
}

let PHASE_HASH = 0;
let PHASE_KILLER_1 = 1;
let PHASE_KILLER_2 = 2;
let PHASE_GEN_MOVES = 3;
let PHASE_REST = 4;
class MoveSort {

  mvs: number[] = []
  vls: number[];
  mvHash: number;
  pos: Position;
  mvKiller1: number
  mvKiller2: number
  historyTable: any;
  phase: number;
  singleReply: boolean;
  index: number;

  constructor(mvHash: number,
    pos: Position, killerTable: number[][], historyTable: number[]) {
    this.mvs = [];
    this.vls = [];
    this.mvHash = this.mvKiller1 = this.mvKiller2 = 0;
    this.pos = pos;
    this.historyTable = historyTable;
    this.phase = PHASE_HASH;
    this.index = 0;
    this.singleReply = false;

    if (pos.inCheck()) {
      this.phase = PHASE_REST;
      let mvsAll = pos.generateMoves(null);
      for (let i = 0; i < mvsAll.length; i++) {
        let mv = mvsAll[i]
        if (!pos.makeMove(mv)) {
          continue;
        }
        pos.undoMakeMove();
        this.mvs.push(mv);
        this.vls.push(mv == mvHash ? 0x7fffffff :
          historyTable[pos.historyIndex(mv)]);
      }
      shellSort(this.mvs, this.vls);
      this.singleReply = this.mvs.length == 1;
    } else {
      this.mvHash = mvHash;
      this.mvKiller1 = killerTable[pos.distance][0];
      this.mvKiller2 = killerTable[pos.distance][1];
    }
  }

  next() {
    switch (this.phase) {
      case PHASE_HASH:
        this.phase = PHASE_KILLER_1;
        if (this.mvHash > 0) {
          return this.mvHash;
        }
      // No Break
      case PHASE_KILLER_1:
        this.phase = PHASE_KILLER_2;
        if (this.mvKiller1 != this.mvHash && this.mvKiller1 > 0 &&
          this.pos.legalMove(this.mvKiller1)) {
          return this.mvKiller1;
        }
      // No Break
      case PHASE_KILLER_2:
        this.phase = PHASE_GEN_MOVES;
        if (this.mvKiller2 != this.mvHash && this.mvKiller2 > 0 &&
          this.pos.legalMove(this.mvKiller2)) {
          return this.mvKiller2;
        }
      // No Break
      case PHASE_GEN_MOVES:
        this.phase = PHASE_REST;
        this.mvs = this.pos.generateMoves(null);
        this.vls = [];
        for (let i = 0; i < this.mvs.length; i++) {
          this.vls.push(this.historyTable[this.pos.historyIndex(this.mvs[i])]);
        }
        shellSort(this.mvs, this.vls);
        this.index = 0;
      // No Break
      default:
        while (this.index < this.mvs.length) {
          let mv = this.mvs[this.index];
          this.index++;
          if (mv != this.mvHash && mv != this.mvKiller1 && mv != this.mvKiller2) {
            return mv;
          }
        }
    }
    return 0;
  }
}
let LIMIT_DEPTH = 64;
let NULL_DEPTH = 2;
let RANDOMNESS = 8;

let HASH_ALPHA = 1;
let HASH_BETA = 2;
let HASH_PV = 3;

class Search {
  hashMask: number
  mvResult: number = 0
  pos: Position
  allMillis: number = 0
  hashTable: { depth: number; flag: number; vl: number; mv: number; zobristLock: number; }[] = []
  historyTable: number[] = []
  allNodes: number = 0
  killerTable: number[][] = []

  constructor(pos: any, hashLevel: number) {
    this.hashMask = (1 << hashLevel) - 1;
    this.pos = pos;
  }


  getHashItem() {
    return this.hashTable[this.pos.zobristKey & this.hashMask];
  }

  probeHash(vlAlpha: number, vlBeta: number, depth: number, mv: any[]) {
    let hash = this.getHashItem();
    if (hash.zobristLock != this.pos.zobristLock) {
      mv[0] = 0;
      return -MATE_VALUE;
    }
    mv[0] = hash.mv;
    let mate = false;
    if (hash.vl > WIN_VALUE) {
      if (hash.vl <= BAN_VALUE) {
        return -MATE_VALUE;
      }
      hash.vl -= this.pos.distance;
      mate = true;
    } else if (hash.vl < -WIN_VALUE) {
      if (hash.vl >= -BAN_VALUE) {
        return -MATE_VALUE;
      }
      hash.vl += this.pos.distance;
      mate = true;
    } else if (hash.vl == this.pos.drawValue()) {
      return -MATE_VALUE;
    }
    if (hash.depth < depth && !mate) {
      return -MATE_VALUE;
    }
    if (hash.flag == HASH_BETA) {
      return (hash.vl >= vlBeta ? hash.vl : -MATE_VALUE);
    }
    if (hash.flag == HASH_ALPHA) {
      return (hash.vl <= vlAlpha ? hash.vl : -MATE_VALUE);
    }
    return hash.vl;
  }

  recordHash(flag: any, vl: number, depth: number, mv: number) {
    let hash = this.getHashItem();
    if (hash.depth > depth) {
      return;
    }
    hash.flag = flag;
    hash.depth = depth;
    if (vl > WIN_VALUE) {
      if (mv == 0 && vl <= BAN_VALUE) {
        return;
      }
      hash.vl = vl + this.pos.distance;
    } else if (vl < -WIN_VALUE) {
      if (mv == 0 && vl >= -BAN_VALUE) {
        return;
      }
      hash.vl = vl - this.pos.distance;
    } else if (vl == this.pos.drawValue() && mv == 0) {
      return;
    } else {
      hash.vl = vl;
    }
    hash.mv = mv;
    hash.zobristLock = this.pos.zobristLock;
  }

  setBestMove(mv: any, depth: number) {
    this.historyTable[this.pos.historyIndex(mv)] += depth * depth;
    let mvsKiller = this.killerTable[this.pos.distance];
    if (mvsKiller[0] != mv) {
      mvsKiller[1] = mvsKiller[0];
      mvsKiller[0] = mv;
    }
  }

  searchQuiesc(vlAlpha_: any, vlBeta: number) {
    let vlAlpha = vlAlpha_;
    this.allNodes++;
    let vl = this.pos.mateValue();
    if (vl >= vlBeta) {
      return vl;
    }
    let vlRep = this.pos.repStatus(1);
    if (vlRep > 0) {
      return this.pos.repValue(vlRep);
    }
    if (this.pos.distance == LIMIT_DEPTH) {
      return this.pos.evaluate();
    }
    let vlBest = -MATE_VALUE;
    let mvs = [], vls: any[] = [];
    if (this.pos.inCheck()) {
      mvs = this.pos.generateMoves(null);
      for (let i = 0; i < mvs.length; i++) {
        vls.push(this.historyTable[this.pos.historyIndex(mvs[i])]);
      }
      shellSort(mvs, vls);
    } else {
      vl = this.pos.evaluate();
      if (vl > vlBest) {
        if (vl >= vlBeta) {
          return vl;
        }
        vlBest = vl;
        vlAlpha = Math.max(vl, vlAlpha);
      }
      mvs = this.pos.generateMoves(vls);
      shellSort(mvs, vls);
      for (let i = 0; i < mvs.length; i++) {
        if (vls[i] < 10 || (vls[i] < 20 && HOME_HALF(DST(mvs[i]), this.pos.sdPlayer))) {
          mvs.length = i;
          break;
        }
      }
    }
    for (let i = 0; i < mvs.length; i++) {
      if (!this.pos.makeMove(mvs[i])) {
        continue;
      }
      vl = -this.searchQuiesc(-vlBeta, -vlAlpha);
      this.pos.undoMakeMove();
      if (vl > vlBest) {
        if (vl >= vlBeta) {
          return vl;
        }
        vlBest = vl;
        vlAlpha = Math.max(vl, vlAlpha);
      }
    }
    return vlBest == -MATE_VALUE ? this.pos.mateValue() : vlBest;
  }

  searchFull(vlAlpha_: any, vlBeta: number, depth: number, noNull: any) {
    let vlAlpha = vlAlpha_;
    if (depth <= 0) {
      return this.searchQuiesc(vlAlpha, vlBeta);
    }
    this.allNodes++;
    let vl = this.pos.mateValue();
    if (vl >= vlBeta) {
      return vl;
    }
    let vlRep = this.pos.repStatus(1);
    if (vlRep > 0) {
      return this.pos.repValue(vlRep);
    }
    let mvHash = [0];
    vl = this.probeHash(vlAlpha, vlBeta, depth, mvHash);
    if (vl > -MATE_VALUE) {
      return vl;
    }
    if (this.pos.distance == LIMIT_DEPTH) {
      return this.pos.evaluate();
    }
    if (!noNull && !this.pos.inCheck() && this.pos.nullOkay()) {
      this.pos.nullMove();
      vl = -this.searchFull(-vlBeta, 1 - vlBeta, depth - NULL_DEPTH - 1, true);
      this.pos.undoNullMove();
      if (vl >= vlBeta && (this.pos.nullSafe() ||
        this.searchFull(vlAlpha, vlBeta, depth - NULL_DEPTH, true) >= vlBeta)) {
        return vl;
      }
    }
    let hashFlag = HASH_ALPHA;
    let vlBest = -MATE_VALUE;
    let mvBest = 0;
    let sort = new MoveSort(mvHash[0], this.pos, this.killerTable, this.historyTable);
    let mv;
    while ((mv = sort.next()) > 0) {
      if (!this.pos.makeMove(mv)) {
        continue;
      }
      let newDepth = this.pos.inCheck() || sort.singleReply ? depth : depth - 1;
      if (vlBest == -MATE_VALUE) {
        vl = -this.searchFull(-vlBeta, -vlAlpha, newDepth, false);
      } else {
        vl = -this.searchFull(-vlAlpha - 1, -vlAlpha, newDepth, false);
        if (vl > vlAlpha && vl < vlBeta) {
          vl = -this.searchFull(-vlBeta, -vlAlpha, newDepth, false);
        }
      }
      this.pos.undoMakeMove();
      if (vl > vlBest) {
        vlBest = vl;
        if (vl >= vlBeta) {
          hashFlag = HASH_BETA;
          mvBest = mv;
          break;
        }
        if (vl > vlAlpha) {
          vlAlpha = vl;
          hashFlag = HASH_PV;
          mvBest = mv;
        }
      }
    }
    if (vlBest == -MATE_VALUE) {
      return this.pos.mateValue();
    }
    this.recordHash(hashFlag, vlBest, depth, mvBest);
    if (mvBest > 0) {
      this.setBestMove(mvBest, depth);
    }
    return vlBest;
  }

  searchRoot(depth: number) {
    let vlBest = -MATE_VALUE;
    let sort = new MoveSort(this.mvResult, this.pos, this.killerTable, this.historyTable);
    let mv;
    while ((mv = sort.next()) > 0) {
      if (!this.pos.makeMove(mv)) {
        continue;
      }
      let newDepth = this.pos.inCheck() ? depth : depth - 1;
      let vl;
      if (vlBest == -MATE_VALUE) {
        vl = -this.searchFull(-MATE_VALUE, MATE_VALUE, newDepth, true);
      } else {
        vl = -this.searchFull(-vlBest - 1, -vlBest, newDepth, false);
        if (vl > vlBest) {
          vl = -this.searchFull(-MATE_VALUE, -vlBest, newDepth, true);
        }
      }
      this.pos.undoMakeMove();
      if (vl > vlBest) {
        vlBest = vl;
        this.mvResult = mv;
        if (vlBest > -WIN_VALUE && vlBest < WIN_VALUE) {
          vlBest += Math.floor(Math.random() * RANDOMNESS) -
            Math.floor(Math.random() * RANDOMNESS);
          vlBest = (vlBest == this.pos.drawValue() ? vlBest - 1 : vlBest);
        }
      }
    }
    this.setBestMove(this.mvResult, depth);
    return vlBest;
  }

  searchUnique(vlBeta: number, depth: number) {
    let sort = new MoveSort(this.mvResult, this.pos, this.killerTable, this.historyTable);
    sort.next();
    let mv;
    while ((mv = sort.next()) > 0) {
      if (!this.pos.makeMove(mv)) {
        continue;
      }
      let vl = -this.searchFull(-vlBeta, 1 - vlBeta,
        this.pos.inCheck() ? depth : depth - 1, false);
      this.pos.undoMakeMove();
      if (vl >= vlBeta) {
        return false;
      }
    }
    return true;
  }

  searchMain(depth: number, millis: number) {
    this.mvResult = this.pos.bookMove();
    if (this.mvResult > 0) {
      this.pos.makeMove(this.mvResult);
      if (this.pos.repStatus(3) == 0) {
        this.pos.undoMakeMove();
        return this.mvResult;
      }
      this.pos.undoMakeMove();
    }
    this.hashTable = [];
    for (let i = 0; i <= this.hashMask; i++) {
      this.hashTable.push({ depth: 0, flag: 0, vl: 0, mv: 0, zobristLock: 0 });
    }
    this.killerTable = [];
    for (let i = 0; i < LIMIT_DEPTH; i++) {
      this.killerTable.push([0, 0]);
    }
    this.historyTable = [];
    for (let i = 0; i < 4096; i++) {
      this.historyTable.push(0);
    }
    this.mvResult = 0;
    this.allNodes = 0;
    this.pos.distance = 0;
    let t = new Date().getTime();
    for (let i = 1; i <= depth; i++) {
      let vl = this.searchRoot(i);
      this.allMillis = new Date().getTime() - t;
      if (this.allMillis > millis) {
        break;
      }
      if (vl > WIN_VALUE || vl < -WIN_VALUE) {
        break;
      }
      if (this.searchUnique(1 - WIN_VALUE, i)) {
        break;
      }
    }
    return this.mvResult;
  }

  getKNPS() {
    return this.allNodes / this.allMillis;
  }
}
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



export let RESULT_UNKNOWN = 0;
let RESULT_WIN = 1;
let RESULT_DRAW = 2;
let RESULT_LOSS = 3;

let BOARD_WIDTH = 521;
let BOARD_HEIGHT = 577;
let SQUARE_SIZE = 57;
let SQUARE_LEFT = (BOARD_WIDTH - SQUARE_SIZE * 9) >> 1;
let SQUARE_TOP = (BOARD_HEIGHT - SQUARE_SIZE * 10) >> 1;
let THINKING_SIZE = 32;
let THINKING_LEFT = (BOARD_WIDTH - THINKING_SIZE) >> 1;
let THINKING_TOP = (BOARD_HEIGHT - THINKING_SIZE) >> 1;
let MAX_STEP = 8;
let PIECE_NAME = [
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
  return Math.floor((src * step + dst * (MAX_STEP - step)) / MAX_STEP + .5) + "px";
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
  thinking: HTMLImageElement
  dummy: HTMLDivElement

  onAddMove: Function | undefined = undefined

  constructor(container: HTMLElement, images: string, sounds: any) {
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

    let style = container.style;
    style.position = "relative";
    style.width = BOARD_WIDTH + "px";
    style.height = BOARD_HEIGHT + "px";
    style.background = "url(" + images + "board.jpg) no-repeat";
    let this_ = this;
    for (let sq = 0; sq < 256; sq++) {
      if (!IN_BOARD(sq)) {
        this.imgSquares.push(null);
        continue;
      }
      let img = document.createElement("img");
      let style = img.style;
      style.position = "absolute";
      style.left = `${SQ_X(sq)}px`;
      style.top = `${SQ_Y(sq)}px`;
      style.width = `${SQUARE_SIZE}px`;
      style.height = `${SQUARE_SIZE}px`;
      style.zIndex = "0";
      img.onmousedown = function (sq_) {
        return function () {
          this_.clickSquare(sq_);
        }
      }(sq);
      container.appendChild(img);
      this.imgSquares.push(img);
    }

    this.thinking = document.createElement("img");
    this.thinking.src = images + "thinking.gif";
    style = this.thinking.style;
    style.visibility = "hidden";
    style.position = "absolute";
    style.left = THINKING_LEFT + "px";
    style.top = THINKING_TOP + "px";
    container.appendChild(this.thinking);

    this.dummy = document.createElement("div");
    this.dummy.style.position = "absolute";
    container.appendChild(this.dummy);

    this.flushBoard();
  }


  playSound(soundFile: string) {
    if (!this.sound) {
      return;
    }
    try {
      new Audio(this.sounds + soundFile + ".wav").play();
    } catch (e) {
      this.dummy.innerHTML = "<embed src=\"" + this.sounds + soundFile +
        ".wav\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
    }
  }

  setSearch(hashLevel: number) {
    this.search = hashLevel == 0 ? null : new Search(this.pos, hashLevel);
  }

  flipped(sq: any) {
    return this.computer == 0 ? SQUARE_FLIP(sq) : sq;
  }

  computerMove() {
    return this.pos.sdPlayer == this.computer;
  }

  computerLastMove() {
    return 1 - this.pos.sdPlayer == this.computer;
  }

  addMove(mv: any, computerMove: any) {
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

    let sqSrc = this.flipped(SRC(mv));
    let xSrc = SQ_X(sqSrc);
    let ySrc = SQ_Y(sqSrc);
    let sqDst = this.flipped(DST(mv));
    let xDst = SQ_X(sqDst);
    let yDst = SQ_Y(sqDst);
    let style = this.imgSquares[sqSrc]!!.style;
    style.zIndex = '256';
    let step = MAX_STEP - 1;
    let this_ = this;
    let timer = setInterval(function () {
      if (step == 0) {
        clearInterval(timer);
        style.left = xSrc + "px";
        style.top = ySrc + "px";
        style.zIndex = '0';
        this_.postAddMove(mv, computerMove);
      } else {
        style.left = MOVE_PX(xSrc, xDst, step);
        style.top = MOVE_PX(ySrc, yDst, step);
        step--;
      }
    }, 16);
  }

  postAddMove(mv: any, computerMove: boolean) {
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

      let pc = SIDE_TAG(this.pos.sdPlayer) + PIECE_KING;
      let sqMate = 0;
      for (let sq = 0; sq < 256; sq++) {
        if (this.pos.squares[sq] == pc) {
          sqMate = sq;
          break;
        }
      }
      if (!this.animated || sqMate == 0) {
        this.postMate(computerMove);
        return;
      }

      sqMate = this.flipped(sqMate);
      let style = this.imgSquares[sqMate]!!.style;
      style.zIndex = '256';
      let xMate = SQ_X(sqMate);
      let step = MAX_STEP;
      let this_ = this;
      let timer = setInterval( function () {
        if (step == 0) {
          clearInterval(timer);
          style.left = xMate + "px";
          style.zIndex = '0';
          this_.imgSquares[sqMate]!!.src = this_.images +
            (this_.pos.sdPlayer == 0 ? "r" : "b") + "km.gif";
          this_.postMate(computerMove);
        } else {
          style.left = (xMate + ((step & 1) == 0 ? step : -step) * 2) + "px";
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
      } else if (computerMove == (vlRep < 0)) {
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
    if (typeof this.onAddMove == "function") {
      this.onAddMove();
    }
  }

  postMate(computerMove: any) {
    alertDelay(computerMove ? "请再接再厉！" : "祝贺你取得胜利！");
    this.postAddMove2();
    this.busy = false;
  }

  response() {
    if (this.search == null || !this.computerMove()) {
      this.busy = false;
      return;
    }
    this.thinking.style.visibility = "visible";
    let this_ = this;
    this.busy = true;
    let board = this
    setTimeout( function () {
      this_.addMove(board.search?.searchMain(LIMIT_DEPTH, board.millis), true);
      this_.thinking.style.visibility = "hidden";
    }, 250);
  }

  clickSquare(sq_: any) {
    if (this.busy || this.result != RESULT_UNKNOWN) {
      return;
    }
    let sq = this.flipped(sq_);
    let pc = this.pos.squares[sq];
    if ((pc & SIDE_TAG(this.pos.sdPlayer)) != 0) {
      this.playSound("click");
      if (this.mvLast != 0) {
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

  drawSquare(sq: number, selected: any) {
    let img = this.imgSquares[this.flipped(sq)]!!;
    img.src = this.images + PIECE_NAME[this.pos.squares[sq]] + ".gif";
    img.style.backgroundImage = selected ? "url(" + this.images + "oos.gif)" : "";
  }

  flushBoard() {
    this.mvLast = this.pos.mvList[this.pos.mvList.length - 1];
    for (let sq = 0; sq < 256; sq++) {
      if (IN_BOARD(sq)) {
        this.drawSquare(sq, sq == SRC(this.mvLast) || sq == DST(this.mvLast));
      }
    }
  }

  restart(fen: any) {
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

  setSound(sound: any) {
    this.sound = sound;
    if (sound) {
      this.playSound("click");
    }
  }
}