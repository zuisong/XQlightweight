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

export const MATE_VALUE = 10000;
export const BAN_VALUE = MATE_VALUE - 100;
export const WIN_VALUE = MATE_VALUE - 200;
export const NULL_SAFE_MARGIN = 400;
export const NULL_OKAY_MARGIN = 200;
export const DRAW_VALUE = 20;
export const ADVANCED_VALUE = 3;

export const PIECE_KING = 0;
export const PIECE_ADVISOR = 1;
export const PIECE_BISHOP = 2;
export const PIECE_KNIGHT = 3;
export const PIECE_ROOK = 4;
export const PIECE_CANNON = 5;
export const PIECE_PAWN = 6;

export const RANK_TOP = 3;
export const RANK_BOTTOM = 12;
export const FILE_LEFT = 3;
export const FILE_RIGHT = 11;

export const ADD_PIECE = false;
export const DEL_PIECE = true;

const IN_BOARD_ = [
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

const IN_FORT_ = [
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

let KING_DELTA: number[] = [-16, -1, 1, 16];
let ADVISOR_DELTA: number[] = [-17, -15, 15, 17];
let KNIGHT_DELTA: number[][] = [[-33, -31], [-18, 14], [-14, 18], [31, 33]];
let KNIGHT_CHECK_DELTA: number[][] = [[-33, -18], [-31, -14], [14, 31], [18, 33]];
let MVV_VALUE: number[] = [50, 10, 10, 30, 40, 30, 20, 0];

let PIECE_VALUE: number[][] = [
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
        0 , 0 , 0 , 0  , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 90 , 90  , 90  , 96  , 90  , 96  , 90  , 90  , 90 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 90 , 96  , 103 , 97  , 94  , 97  , 103 , 96  , 90 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 92 , 98  , 99  , 103 , 99  , 103 , 99  , 98  , 92 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 93 , 108 , 100 , 107 , 100 , 107 , 100 , 108 , 93 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 90 , 100 , 99  , 103 , 104 , 103 , 99  , 100 , 90 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 90 , 98  , 101 , 102 , 103 , 102 , 101 , 98  , 90 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 92 , 94  , 98  , 95  , 98  , 95  , 98  , 94  , 92 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 93 , 92  , 94  , 95  , 92  , 95  , 94  , 92  , 93 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 85 , 90  , 92  , 93  , 78  , 93  , 92  , 90  , 85 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 88 , 85  , 90  , 88  , 90  , 88  , 90  , 85  , 88 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0  , 0 , 0 , 0 , 0 ,
    ], [
        0 , 0 , 0 , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 206 , 208 , 207 , 213 , 214 , 213 , 207 , 208 , 206 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 206 , 212 , 209 , 216 , 233 , 216 , 209 , 212 , 206 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 206 , 208 , 207 , 214 , 216 , 214 , 207 , 208 , 206 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 206 , 213 , 213 , 216 , 216 , 216 , 213 , 213 , 206 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 208 , 211 , 211 , 214 , 215 , 214 , 211 , 211 , 208 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 208 , 212 , 212 , 214 , 215 , 214 , 212 , 212 , 208 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 204 , 209 , 204 , 212 , 214 , 212 , 204 , 209 , 204 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 198 , 208 , 204 , 212 , 212 , 212 , 204 , 208 , 198 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 200 , 208 , 206 , 212 , 200 , 212 , 206 , 208 , 200 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 194 , 206 , 204 , 212 , 200 , 212 , 204 , 206 , 194 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,

    ], [
        0 , 0 , 0 , 0   , 0   , 0   , 0  , 0   , 0  , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0   , 0   , 0   , 0  , 0   , 0  , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0   , 0   , 0   , 0  , 0   , 0  , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 100 , 100 , 96  , 91 , 90  , 91 , 96  , 100 , 100 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 98  , 98  , 96  , 92 , 89  , 92 , 96  , 98  , 98  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 97  , 97  , 96  , 91 , 92  , 91 , 96  , 97  , 97  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 96  , 99  , 99  , 98 , 100 , 98 , 99  , 99  , 96  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 96  , 96  , 96  , 96 , 100 , 96 , 96  , 96  , 96  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 95  , 96  , 99  , 96 , 100 , 96 , 99  , 96  , 95  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 96  , 96  , 96  , 96 , 96  , 96 , 96  , 96  , 96  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 97  , 96  , 100 , 99 , 101 , 99 , 100 , 96  , 97  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 96  , 97  , 98  , 98 , 98  , 98 , 98  , 97  , 96  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 96  , 96  , 97  , 99 , 99  , 99 , 97  , 96  , 96  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0   , 0   , 0   , 0  , 0   , 0  , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0   , 0   , 0   , 0  , 0   , 0  , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0   , 0   , 0   , 0  , 0   , 0  , 0   , 0   , 0   , 0 , 0 , 0 , 0 ,

    ], [
        0 , 0 , 0 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 9  , 9  , 9  , 11 , 13 , 11 , 9  , 9  , 9  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 19 , 24 , 34 , 42 , 44 , 42 , 34 , 24 , 19 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 19 , 24 , 32 , 37 , 37 , 37 , 32 , 24 , 19 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 19 , 23 , 27 , 29 , 30 , 29 , 27 , 23 , 19 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 14 , 18 , 20 , 27 , 29 , 27 , 20 , 18 , 14 , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 7  , 0  , 13 , 0  , 16 , 0  , 13 , 0  , 7  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 7  , 0  , 7  , 0  , 15 , 0  , 7  , 0  , 7  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0  , 0  , 1  , 1  , 1  , 0  , 0  , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0  , 0  , 2  , 2  , 2  , 0  , 0  , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0  , 0  , 11 , 15 , 11 , 0  , 0  , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0 , 0 , 0 , 0 ,
        0 , 0 , 0 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0 , 0 , 0 , 0 ,

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

const FEN_PIECE = "        KABNRCP kabnrcp ";

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
        this.state = Array.from(Array(256).keys());
        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + this.state[i] + key[i % key.length]) & 0xff;
            this.swap(i, j);
        }
    }


   private swap(i: number, j: number) {
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

let PreGen_zobristKeyTable: number[][] = [], PreGen_zobristLockTable: number[][] = [];

let rc4 = new RC4([0]);
const PreGen_zobristKeyPlayer = rc4.nextLong();
rc4.nextLong();
const PreGen_zobristLockPlayer = rc4.nextLong();
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
rc4.nextLong();

export class Position {
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
        this.squares =  Array(256).fill(0);
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
