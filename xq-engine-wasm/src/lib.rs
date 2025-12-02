use wasm_bindgen::prelude::*;
use lazy_static::lazy_static; // Import lazy_static

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}


// --- Constants from position.ts ---

pub const MATE_VALUE: i32 = 10000;
pub const BAN_VALUE: i32 = MATE_VALUE - 100;
pub const WIN_VALUE: i32 = MATE_VALUE - 200;
pub const NULL_SAFE_MARGIN: i32 = 400;
pub const NULL_OKAY_MARGIN: i32 = 200;
pub const DRAW_VALUE: i32 = 20;
pub const ADVANCED_VALUE: i32 = 3;

pub const PIECE_KING: u8 = 0;
pub const PIECE_ADVISOR: u8 = 1;
pub const PIECE_BISHOP: u8 = 2;
pub const PIECE_KNIGHT: u8 = 3;
pub const PIECE_ROOK: u8 = 4;
pub const PIECE_CANNON: u8 = 5;
pub const PIECE_PAWN: u8 = 6;

pub const RANK_TOP: u8 = 3;
pub const RANK_BOTTOM: u8 = 12;
pub const FILE_LEFT: u8 = 3;
pub const FILE_RIGHT: u8 = 11;

pub const ADD_PIECE: bool = false;
pub const DEL_PIECE: bool = true;

const IN_BOARD_DATA: [u8; 256] = [
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

const IN_FORT_DATA: [u8; 256] = [
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

const LEGAL_SPAN_DATA: [u8; 512] = [
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
];

const KNIGHT_PIN_DATA: [i8; 512] = [
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
];

const KING_DELTA: [i8; 4] = [-16, -1, 1, 16];
const ADVISOR_DELTA: [i8; 4] = [-17, -15, 15, 17];
const KNIGHT_DELTA: [[i8; 2]; 4] = [[-33, -31], [-18, 14], [-14, 18], [31, 33]];
const KNIGHT_CHECK_DELTA: [[i8; 2]; 4] = [[-33, -18], [-31, -14], [14, 31], [18, 33]];
const MVV_VALUE: [i32; 8] = [50, 10, 10, 30, 40, 30, 20, 0];

// PIECE_VALUE data is quite large, will define it similarly to above.
const PIECE_VALUE_DATA: [[i32; 256]; 5] = [
    [ // PIECE_KING, PIECE_ADVISOR, PIECE_BISHOP (values from 0-6 in constants, but data uses 0,1,2,3,4 as indices)
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
    ], [ // PIECE_KNIGHT
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
    ], [ // PIECE_ROOK
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

    ], [ // PIECE_CANNON
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

    ], [ // PIECE_PAWN
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
    ],
];


static FEN_PIECE_MAP: &str = "        KABNRCP kabnrcp ";


// Helper Functions

#[inline(always)]
pub fn in_board(sq: u8) -> bool {
    IN_BOARD_DATA[sq as usize] != 0
}

#[inline(always)]
pub fn in_fort(sq: u8) -> bool {
    IN_FORT_DATA[sq as usize] != 0
}

#[inline(always)]
pub fn rank_y(sq: u8) -> u8 {
    sq >> 4
}

#[inline(always)]
pub fn file_x(sq: u8) -> u8 {
    sq & 15
}

#[inline(always)]
pub fn coord_xy(x: u8, y: u8) -> u8 {
    x + (y << 4)
}

#[inline(always)]
pub fn square_flip(sq: u8) -> u8 {
    254 - sq
}

#[inline(always)]
pub fn file_flip(x: u8) -> u8 {
    14 - x
}

#[inline(always)]
pub fn rank_flip(y: u8) -> u8 {
    15 - y
}

#[inline(always)]
pub fn mirror_square(sq: u8) -> u8 {
    coord_xy(file_flip(file_x(sq)), rank_y(sq))
}

#[inline(always)]
pub fn square_forward(sq: u8, sd: u8) -> u8 {
    sq.wrapping_sub(16).wrapping_add(sd << 5)
}

#[inline(always)]
pub fn king_span(sq_src: u8, sq_dst: u8) -> bool {
    LEGAL_SPAN_DATA[(sq_dst as i16 - sq_src as i16 + 256) as usize] == 1
}

#[inline(always)]
pub fn advisor_span(sq_src: u8, sq_dst: u8) -> bool {
    LEGAL_SPAN_DATA[(sq_dst as i16 - sq_src as i16 + 256) as usize] == 2
}

#[inline(always)]
pub fn bishop_span(sq_src: u8, sq_dst: u8) -> bool {
    LEGAL_SPAN_DATA[(sq_dst as i16 - sq_src as i16 + 256) as usize] == 3
}

#[inline(always)]
pub fn bishop_pin(sq_src: u8, sq_dst: u8) -> u8 {
    ((sq_src as u16 + sq_dst as u16) >> 1) as u8
}

#[inline(always)]
pub fn knight_pin(sq_src: u8, sq_dst: u8) -> u8 {
    (sq_src as i16 + KNIGHT_PIN_DATA[(sq_dst as i16 - sq_src as i16 + 256) as usize] as i16) as u8
}

#[inline(always)]
pub fn home_half(sq: u8, sd: u8) -> bool {
    (sq & 0x80) != (sd << 7)
}

#[inline(always)]
pub fn away_half(sq: u8, sd: u8) -> bool {
    (sq & 0x80) == (sd << 7)
}

#[inline(always)]
pub fn same_half(sq_src: u8, sq_dst: u8) -> bool {
    ((sq_src ^ sq_dst) & 0x80) == 0
}

#[inline(always)]
pub fn same_rank(sq_src: u8, sq_dst: u8) -> bool {
    ((sq_src ^ sq_dst) & 0xf0) == 0
}

#[inline(always)]
pub fn same_file(sq_src: u8, sq_dst: u8) -> bool {
    ((sq_src ^ sq_dst) & 0x0f) == 0
}

#[inline(always)]
pub fn side_tag(sd: u8) -> u8 {
    8 + (sd << 3)
}

#[inline(always)]
pub fn opp_side_tag(sd: u8) -> u8 {
    16 - (sd << 3)
}

#[inline(always)]
pub fn src(mv: u16) -> u8 {
    (mv & 255) as u8
}

#[inline(always)]
pub fn dst(mv: u16) -> u8 {
    (mv >> 8) as u8
}

#[inline(always)]
pub fn make_move(sq_src: u8, sq_dst: u8) -> u16 {
    (sq_src as u16) + ((sq_dst as u16) << 8)
}

#[inline(always)]
pub fn mirror_move(mv: u16) -> u16 {
    make_move(mirror_square(src(mv)), mirror_square(dst(mv)))
}

#[inline(always)]
pub fn mvv_lva(pc: u8, lva: i32) -> i32 {
    MVV_VALUE[(pc & 7) as usize] - lva
}

#[inline(always)]
pub fn char_to_piece(c: char) -> i8 {
    match c {
        'K' => PIECE_KING as i8,
        'A' => PIECE_ADVISOR as i8,
        'B' | 'E' => PIECE_BISHOP as i8,
        'H' | 'N' => PIECE_KNIGHT as i8,
        'R' => PIECE_ROOK as i8,
        'C' => PIECE_CANNON as i8,
        'P' => PIECE_PAWN as i8,
        _ => -1,
    }
}

// RC4 implementation for Zobrist hashing
struct Rc4 {
    x: u8,
    y: u8,
    state: [u8; 256],
}

impl Rc4 {
    fn new(key: &[u8]) -> Self {
        let mut state: [u8; 256] = core::array::from_fn(|i| i as u8);
        let mut j: u8 = 0;
        for i in 0..256 {
            j = j.wrapping_add(state[i]).wrapping_add(key[i % key.len()]);
            state.swap(i, j as usize);
        }
        Rc4 { x: 0, y: 0, state }
    }

    fn next_byte(&mut self) -> u8 {
        self.x = self.x.wrapping_add(1);
        self.y = self.y.wrapping_add(self.state[self.x as usize]);
        self.state.swap(self.x as usize, self.y as usize);
        let t = self.state[self.x as usize].wrapping_add(self.state[self.y as usize]);
        self.state[t as usize]
    }

    fn next_long(&mut self) -> u64 {
        let n0 = self.next_byte() as u64;
        let n1 = self.next_byte() as u64;
        let n2 = self.next_byte() as u64;
        let n3 = self.next_byte() as u64;
        n0 | (n1 << 8) | (n2 << 16) | (n3 << 24)
    }
}


// Zobrist Hashing Pre-computation using lazy_static
lazy_static! {
    static ref ZOBRIST_KEY_TABLE: Vec<Vec<u64>> = {
        let mut table = Vec::with_capacity(14);
        let mut rc4 = Rc4::new(&[0]); // Key is [0] as in JS
        rc4.next_long(); // Discard as per JS
        rc4.next_long(); // Discard as per JS
        for _ in 0..14 {
            let mut keys = Vec::with_capacity(256);
            for _ in 0..256 {
                keys.push(rc4.next_long());
            }
            table.push(keys);
        }
        table
    };

    static ref ZOBRIST_LOCK_TABLE: Vec<Vec<u64>> = {
        let mut table = Vec::with_capacity(14);
        let mut rc4 = Rc4::new(&[0]); // Key is [0] as in JS
        rc4.next_long(); // Discard as per JS
        rc4.next_long(); // Discard as per JS
        for _ in 0..14 {
            let mut locks = Vec::with_capacity(256);
            for _ in 0..256 {
                rc4.next_long(); // Discard as per JS
                locks.push(rc4.next_long());
            }
            table.push(locks);
        }
        table
    };

    static ref ZOBRIST_KEY_PLAYER: u64 = {
        let mut rc4 = Rc4::new(&[0]);
        rc4.next_long()
    };
    static ref ZOBRIST_LOCK_PLAYER: u64 = {
        let mut rc4 = Rc4::new(&[0]);
        rc4.next_long(); // Discard as per JS
        rc4.next_long()
    };
}


// --- Position Struct ---

#[wasm_bindgen]
pub struct Position {
    sd_player: u8,
    squares: Vec<u8>,
    zobrist_key: u64,
    zobrist_lock: u64,
    vl_white: i32,
    vl_black: i32,

    mv_list: Vec<u16>,
    pc_list: Vec<u8>,
    key_list: Vec<u64>,
    chk_list: Vec<bool>,
    distance: u32,
}

#[wasm_bindgen]
impl Position {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let mut pos = Position {
            sd_player: 0,
            squares: vec![0; 256],
            zobrist_key: 0,
            zobrist_lock: 0,
            vl_white: 0,
            vl_black: 0,
            mv_list: vec![0],
            pc_list: vec![0],
            key_list: vec![0],
            chk_list: vec![false],
            distance: 0,
        };
        pos.clear_board(); // Initialize with clear board
        pos.set_irrev();   // Initialize history
        pos
    }

    fn clear_board(&mut self) {
        self.sd_player = 0;
        self.squares.fill(0);
        self.zobrist_key = 0;
        self.zobrist_lock = 0;
        self.vl_white = 0;
        self.vl_black = 0;
    }

    fn set_irrev(&mut self) {
        self.mv_list = vec![0];
        self.pc_list = vec![0];
        self.key_list = vec![0];
        self.chk_list = vec![self.checked()];
        self.distance = 0;
    }

    fn add_piece(&mut self, sq: u8, pc: u8, b_del: bool) {
        self.squares[sq as usize] = if b_del { 0 } else { pc };
        
        let mut pc_adjust: usize;
        if pc < 16 {
            pc_adjust = (pc - 8) as usize; // Red pieces are 8-14
            self.vl_white += if b_del { -PIECE_VALUE_DATA[pc_adjust][sq as usize] } else { PIECE_VALUE_DATA[pc_adjust][sq as usize] };
        } else {
            pc_adjust = (pc - 16) as usize; // Black pieces are 16-22
            self.vl_black += if b_del { -PIECE_VALUE_DATA[pc_adjust][square_flip(sq) as usize] } else { PIECE_VALUE_DATA[pc_adjust][square_flip(sq) as usize] };
            pc_adjust += 7; // Adjust index for zobrist tables for black pieces
        }
        self.zobrist_key ^= ZOBRIST_KEY_TABLE[pc_adjust][sq as usize];
        self.zobrist_lock ^= ZOBRIST_LOCK_TABLE[pc_adjust][sq as usize];
    }

    pub fn to_fen(&self) -> String {
        let mut fen = String::new();
        for y in RANK_TOP..=RANK_BOTTOM {
            let mut k = 0;
            for x in FILE_LEFT..=FILE_RIGHT {
                let pc = self.squares[coord_xy(x, y) as usize];
                if pc > 0 {
                    if k > 0 {
                        fen.push(std::char::from_digit(k as u32, 10).unwrap());
                        k = 0;
                    }
                    fen.push(FEN_PIECE_MAP.chars().nth(pc as usize).unwrap());
                } else {
                    k += 1;
                }
            }
            if k > 0 {
                fen.push(std::char::from_digit(k as u32, 10).unwrap());
            }
            fen.push('/');
        }
        fen.pop(); // Remove last '/'
        fen + " " + (if self.sd_player == 0 { "w" } else { "b" })
    }

    pub fn from_fen(&mut self, fen: &str) -> bool {
        self.clear_board();
        let mut y = RANK_TOP;
        let mut x = FILE_LEFT;
        let mut chars = fen.chars().peekable();

        while let Some(&c) = chars.peek() {
            match c {
                '/' => {
                    chars.next();
                    x = FILE_LEFT;
                    y = y.wrapping_add(1);
                    if y > RANK_BOTTOM {
                        break;
                    }
                },
                '1'..='9' => {
                    chars.next();
                    x = x.wrapping_add(c.to_digit(10).unwrap() as u8);
                },
                'K'..='Z' => {
                    chars.next();
                    if x <= FILE_RIGHT {
                        let pt = char_to_piece(c);
                        if pt >= 0 {
                            self.add_piece(coord_xy(x, y), pt as u8 + 8, ADD_PIECE);
                        }
                        x = x.wrapping_add(1);
                    }
                },
                'a'..='z' => {
                    chars.next();
                    if x <= FILE_RIGHT {
                        let pt_char = c.to_ascii_uppercase();
                        let pt = char_to_piece(pt_char);
                        if pt >= 0 {
                            self.add_piece(coord_xy(x, y), pt as u8 + 16, ADD_PIECE);
                        }
                        x = x.wrapping_add(1);
                    }
                },
                ' ' => {
                    chars.next();
                    break;
                },
                _ => return false, // Invalid FEN character
            }
        }

        if let Some(&c) = chars.peek() {
            if c == 'b' {
                if self.sd_player == 0 {
                    self.change_side();
                }
            } else if c == 'w' {
                if self.sd_player == 1 {
                    self.change_side();
                }
            }
            // Advance past 'w' or 'b'
            chars.next();
        }
        // Discard rest of FEN string (castling, en passant, halfmove clock, fullmove number)
        // For simplicity, we only care about board and turn
        
        self.set_irrev();
        true
    }

    fn checked(&self) -> bool {
        let pc_self_side = side_tag(self.sd_player);
        let pc_opp_side = opp_side_tag(self.sd_player);

        // Find current player's king
        let mut king_sq: u8 = 0;
        let mut king_found = false;
        for sq in 0..256 {
            if self.squares[sq as usize] == pc_self_side + PIECE_KING {
                king_sq = sq;
                king_found = true;
                break;
            }
        }
        if !king_found {
            return false; // Should not happen in a valid game state
        }

        // Check for Pawn attacks
        // Front
        let sq_pawn_front = square_forward(king_sq, self.sd_player);
        if in_board(sq_pawn_front) && self.squares[sq_pawn_front as usize] == pc_opp_side + PIECE_PAWN {
            return true;
        }
        // Sides
        for delta in [-1_i8, 1_i8].iter() {
            let sq_pawn_side = (king_sq as i16 + *delta as i16) as u8;
            if in_board(sq_pawn_side) && self.squares[sq_pawn_side as usize] == pc_opp_side + PIECE_PAWN {
                return true;
            }
        }

        // Check for Knight attacks
        for i in 0..4 {
            let sq_knight_pin_loc = (king_sq as i16 + ADVISOR_DELTA[i] as i16) as u8;
            if in_board(sq_knight_pin_loc) && self.squares[sq_knight_pin_loc as usize] == 0 {
                for j in 0..2 {
                    let sq_knight_attack = (king_sq as i16 + KNIGHT_CHECK_DELTA[i][j] as i16) as u8;
                    if in_board(sq_knight_attack) && self.squares[sq_knight_attack as usize] == pc_opp_side + PIECE_KNIGHT {
                        return true;
                    }
                }
            }
        }

        // Check for Rook/King/Cannon attacks
        for i in 0..4 {
            let delta = KING_DELTA[i];
            let mut sq_curr = (king_sq as i16 + delta as i16) as u8;
            
            // Rook/King
            while in_board(sq_curr) {
                let pc_curr = self.squares[sq_curr as usize];
                if pc_curr > 0 {
                    if pc_curr == pc_opp_side + PIECE_ROOK || pc_curr == pc_opp_side + PIECE_KING {
                        return true;
                    }
                    break; // Blocked by another piece
                }
                sq_curr = (sq_curr as i16 + delta as i16) as u8;
            }

            // Cannon
            let mut sq_cannon_check = (king_sq as i16 + delta as i16) as u8; // Start one step from king
            let mut count_pieces = 0;
            while in_board(sq_cannon_check) {
                let pc_curr = self.squares[sq_cannon_check as usize];
                if pc_curr > 0 {
                    count_pieces += 1;
                }
                if count_pieces == 2 {
                    if pc_curr == pc_opp_side + PIECE_CANNON {
                        return true;
                    }
                    break; // Blocked by third piece
                }
                sq_cannon_check = (sq_cannon_check as i16 + delta as i16) as u8;
            }
        }

        false
    }

    fn move_piece(&mut self, mv: u16) {
        let sq_src = src(mv);
        let sq_dst = dst(mv);
        let pc = self.squares[sq_dst as usize];
        self.pc_list.push(pc);
        if pc > 0 {
            self.add_piece(sq_dst, pc, DEL_PIECE);
        }
        let pc_src = self.squares[sq_src as usize];
        self.add_piece(sq_src, pc_src, DEL_PIECE);
        self.add_piece(sq_dst, pc_src, ADD_PIECE);
        self.mv_list.push(mv);
    }

    fn undo_move_piece(&mut self) {
        let mv = *self.mv_list.last().unwrap(); // Get without popping
        let sq_src = src(mv);
        let sq_dst = dst(mv);

        let pc_moved = self.squares[sq_dst as usize]; // Piece that moved to sq_dst
        self.add_piece(sq_dst, pc_moved, DEL_PIECE); // Clear destination
        self.add_piece(sq_src, pc_moved, ADD_PIECE); // Move piece back to source

        let pc_captured = *self.pc_list.last().unwrap(); // Get without popping
        if pc_captured > 0 {
            self.add_piece(sq_dst, pc_captured, ADD_PIECE); // Restore captured piece
        }
    }

    fn change_side(&mut self) {
        self.sd_player = 1 - self.sd_player;
        self.zobrist_key ^= *ZOBRIST_KEY_PLAYER;
        self.zobrist_lock ^= *ZOBRIST_LOCK_PLAYER;
    }

    pub fn make_move(&mut self, mv: u16) -> bool {
        let zobrist_key = self.zobrist_key;
        let zobrist_lock = self.zobrist_lock;
        let vl_white = self.vl_white;
        let vl_black = self.vl_black;
        let sd_player = self.sd_player;

        self.move_piece(mv);
        if self.checked() {
            // Restore previous state if move is illegal
            // This is critical for generating legal moves without allocating new Positions
            self.undo_move_piece();
            self.mv_list.pop(); // Pop the move
            self.pc_list.pop(); // Pop the captured piece
            
            self.zobrist_key = zobrist_key;
            self.zobrist_lock = zobrist_lock;
            self.vl_white = vl_white;
            self.vl_black = vl_black;
            self.sd_player = sd_player;

            return false;
        }
        self.key_list.push(zobrist_key);
        self.change_side();
        self.chk_list.push(self.checked());
        self.distance += 1;
        true
    }

    pub fn undo_make_move(&mut self) {
        self.distance -= 1;
        self.chk_list.pop();
        self.change_side();
        self.key_list.pop();
        
        let mv = self.mv_list.pop().unwrap(); // Remove the move
        let pc_captured = self.pc_list.pop().unwrap(); // Remove the captured piece

        let sq_src = src(mv);
        let sq_dst = dst(mv);

        let pc_moved = self.squares[sq_dst as usize]; // Piece that moved to sq_dst
        self.add_piece(sq_dst, pc_moved, DEL_PIECE); // Clear destination
        self.add_piece(sq_src, pc_moved, ADD_PIECE); // Move piece back to source

        if pc_captured > 0 {
            self.add_piece(sq_dst, pc_captured, ADD_PIECE); // Restore captured piece
        }
    }

    pub fn legal_move(&self, mv: u16) -> bool {
        let sq_src = src(mv);
        let pc_src = self.squares[sq_src as usize];
        let pc_self_side = side_tag(self.sd_player);
        if (pc_src & pc_self_side) == 0 {
            return false;
        }

        let sq_dst = dst(mv);
        let pc_dst = self.squares[sq_dst as usize];
        if (pc_dst & pc_self_side) != 0 {
            return false;
        }

        match pc_src - pc_self_side {
            PIECE_KING => {
                in_fort(sq_dst) && king_span(sq_src, sq_dst)
            },
            PIECE_ADVISOR => {
                in_fort(sq_dst) && advisor_span(sq_src, sq_dst)
            },
            PIECE_BISHOP => {
                same_half(sq_src, sq_dst) && bishop_span(sq_src, sq_dst) &&
                    self.squares[bishop_pin(sq_src, sq_dst) as usize] == 0
            },
            PIECE_KNIGHT => {
                let sq_pin = knight_pin(sq_src, sq_dst);
                sq_pin != sq_src && self.squares[sq_pin as usize] == 0
            },
            PIECE_ROOK => {
                let delta: i8;
                if same_rank(sq_src, sq_dst) {
                    delta = if sq_dst < sq_src { -1 } else { 1 };
                } else if same_file(sq_src, sq_dst) {
                    delta = if sq_dst < sq_src { -16 } else { 16 };
                } else {
                    return false;
                }
                let mut sq_pin = (sq_src as i16 + delta as i16) as u8;
                while sq_pin != sq_dst && self.squares[sq_pin as usize] == 0 {
                    sq_pin = (sq_pin as i16 + delta as i16) as u8;
                }
                sq_pin == sq_dst
            },
            PIECE_CANNON => {
                let delta: i8;
                if same_rank(sq_src, sq_dst) {
                    delta = if sq_dst < sq_src { -1 } else { 1 };
                } else if same_file(sq_src, sq_dst) {
                    delta = if sq_dst < sq_src { -16 } else { 16 };
                } else {
                    return false;
                }
                let mut sq_pin = (sq_src as i16 + delta as i16) as u8;
                let mut count_pieces = 0;
                while sq_pin != sq_dst {
                    if self.squares[sq_pin as usize] > 0 {
                        count_pieces += 1;
                    }
                    sq_pin = (sq_pin as i16 + delta as i16) as u8;
                }
                count_pieces == 1 && pc_dst > 0 // Must jump exactly one piece and capture
            },
            PIECE_PAWN => {
                if away_half(sq_dst, self.sd_player) && (sq_dst as i16 == sq_src as i16 - 1 || sq_dst as i16 == sq_src as i16 + 1) {
                    return true;
                }
                sq_dst == square_forward(sq_src, self.sd_player)
            },
            _ => false,
        }
    }

    pub fn generate_moves(&self) -> Vec<u16> {
        let mut mvs = Vec::new();
        let pc_self_side = side_tag(self.sd_player);
        let pc_opp_side = opp_side_tag(self.sd_player);

        for sq_src in 0..256 {
            let pc_src = self.squares[sq_src as usize];
            if (pc_src & pc_self_side) == 0 {
                continue;
            }

            match pc_src - pc_self_side {
                PIECE_KING => {
                    for &delta in KING_DELTA.iter() {
                        let sq_dst = (sq_src as i16 + delta as i16) as u8;
                        if in_fort(sq_dst) && (self.squares[sq_dst as usize] & pc_self_side) == 0 {
                            mvs.push(make_move(sq_src, sq_dst));
                        }
                    }
                },
                PIECE_ADVISOR => {
                    for &delta in ADVISOR_DELTA.iter() {
                        let sq_dst = (sq_src as i16 + delta as i16) as u8;
                        if in_fort(sq_dst) && (self.squares[sq_dst as usize] & pc_self_side) == 0 {
                            mvs.push(make_move(sq_src, sq_dst));
                        }
                    }
                },
                PIECE_BISHOP => {
                    for &delta in ADVISOR_DELTA.iter() {
                        let sq_pin = (sq_src as i16 + delta as i16) as u8;
                        if in_board(sq_pin) && self.squares[sq_pin as usize] == 0 {
                            let sq_dst = (sq_src as i16 + 2 * delta as i16) as u8;
                            if in_board(sq_dst) && home_half(sq_dst, self.sd_player) && (self.squares[sq_dst as usize] & pc_self_side) == 0 {
                                mvs.push(make_move(sq_src, sq_dst));
                            }
                        }
                    }
                },
                PIECE_KNIGHT => {
                    for i in 0..4 {
                        let sq_pin = (sq_src as i16 + KING_DELTA[i] as i16) as u8;
                        if in_board(sq_pin) && self.squares[sq_pin as usize] == 0 {
                            for j in 0..2 {
                                let sq_dst = (sq_src as i16 + KNIGHT_DELTA[i][j] as i16) as u8;
                                if in_board(sq_dst) && (self.squares[sq_dst as usize] & pc_self_side) == 0 {
                                    mvs.push(make_move(sq_src, sq_dst));
                                }
                            }
                        }
                    }
                },
                PIECE_ROOK => {
                    for &delta in KING_DELTA.iter() {
                        let mut sq_dst = (sq_src as i16 + delta as i16) as u8;
                        while in_board(sq_dst) {
                            let pc_dst = self.squares[sq_dst as usize];
                            if pc_dst == 0 {
                                mvs.push(make_move(sq_src, sq_dst));
                            } else {
                                if (pc_dst & pc_opp_side) != 0 {
                                    mvs.push(make_move(sq_src, sq_dst));
                                }
                                break;
                            }
                            sq_dst = (sq_dst as i16 + delta as i16) as u8;
                        }
                    }
                },
                PIECE_CANNON => {
                    for &delta in KING_DELTA.iter() {
                        let mut sq_dst = (sq_src as i16 + delta as i16) as u8;
                        let mut blocked = false;
                        while in_board(sq_dst) {
                            let pc_dst = self.squares[sq_dst as usize];
                            if pc_dst > 0 {
                                blocked = true;
                                break;
                            }
                            mvs.push(make_move(sq_src, sq_dst)); // Add moves before meeting first piece
                            sq_dst = (sq_dst as i16 + delta as i16) as u8;
                        }
                        if blocked {
                            sq_dst = (sq_dst as i16 + delta as i16) as u8; // Move past the blocking piece
                            while in_board(sq_dst) {
                                let pc_dst = self.squares[sq_dst as usize];
                                if pc_dst > 0 {
                                    if (pc_dst & pc_opp_side) != 0 {
                                        mvs.push(make_move(sq_src, sq_dst)); // Capture after jumping
                                    }
                                    break;
                                }
                                sq_dst = (sq_dst as i16 + delta as i16) as u8;
                            }
                        }
                    }
                },
                PIECE_PAWN => {
                    let sq_dst_forward = square_forward(sq_src, self.sd_player);
                    if in_board(sq_dst_forward) && (self.squares[sq_dst_forward as usize] & pc_self_side) == 0 {
                        mvs.push(make_move(sq_src, sq_dst_forward));
                    }
                    if away_half(sq_src, self.sd_player) { // Pawns can move sideways after crossing river
                        for &delta in [-1_i8, 1_i8].iter() {
                            let sq_dst_side = (sq_src as i16 + delta as i16) as u8;
                            if in_board(sq_dst_side) && (self.squares[sq_dst_side as usize] & pc_self_side) == 0 {
                                mvs.push(make_move(sq_src, sq_dst_side));
                            }
                        }
                    }
                },
                _ => {},
            }
        }
        mvs
    }

    pub fn get_legal_moves(&self) -> Vec<u16> {
        let pseudo_legal_moves = self.generate_moves();
        let mut legal_moves = Vec::new();
        for &mv in pseudo_legal_moves.iter() {
            // Need a temporary position to test legality
            // This is usually done by making the move on a copy or saving/restoring
            // For now, Position::make_move handles the check and undo if illegal
            // This is incorrect, make_move returns bool if it's legal in terms of leaving king in check
            // but generateMoves needs to actually filter them before returning.

            // To properly do this, we need to create a temporary position.
            let mut temp_pos = Position {
                sd_player: self.sd_player,
                squares: self.squares.clone(),
                zobrist_key: self.zobrist_key,
                zobrist_lock: self.zobrist_lock,
                vl_white: self.vl_white,
                vl_black: self.vl_black,
                mv_list: self.mv_list.clone(),
                pc_list: self.pc_list.clone(),
                key_list: self.key_list.clone(),
                chk_list: self.chk_list.clone(),
                distance: self.distance,
            };
            
            // This will make the move and revert if it leads to check
            if temp_pos.make_move(mv) {
                // If make_move returns true, it means the move was legal and
                // did not leave the king in check. The state of temp_pos
                // is now *after* the legal move.
                legal_moves.push(mv);
            }
        }
        legal_moves
    }

    pub fn get_moves_str(&self) -> String {
        let moves = self.generate_moves();
        let mut result = String::new();
        for &mv in moves.iter() {
            result.push_str(&format!("{:x},", mv));
        }
        result
    }

    pub fn get_piece(&self, sq: u8) -> u8 {
        self.squares[sq as usize]
    }

    pub fn get_sd_player(&self) -> u8 {
        self.sd_player
    }

    pub fn get_history_length(&self) -> usize {
        self.mv_list.len()
    }

    pub fn last_move(&self) -> u16 {
        *self.mv_list.last().unwrap_or(&0)
    }

    pub fn get_move_list(&self) -> Vec<u16> {
        self.mv_list.clone()
    }

    pub fn is_mate(&self) -> bool {
        let legal_moves = self.get_legal_moves();
        legal_moves.is_empty() && self.checked()
    }

    pub fn in_check(&self) -> bool {
        *self.chk_list.last().unwrap_or(&false)
    }

    pub fn rep_status(&self, recur: u32) -> u32 {
        // Implement repetition logic similar to JS
        // This is complex and might depend on actual game history.
        // For now, a placeholder.
        0
    }

    pub fn rep_value(&self, vl_rep: u32) -> i32 {
        // Placeholder
        0
    }

    pub fn captured(&self) -> bool {
        *self.pc_list.last().unwrap_or(&0) > 0
    }

    pub fn get_scores(&self) -> (i32, i32) {
        (self.vl_white, self.vl_black)
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }

    #[test]
    fn test_position_new() {
        let pos = Position::new();
        assert_eq!(pos.sd_player, 0);
        assert_eq!(pos.squares.len(), 256);
        assert!(pos.squares.iter().all(|&x| x == 0));
        assert_eq!(pos.mv_list.len(), 1);
        assert_eq!(pos.pc_list.len(), 1);
        assert_eq!(pos.key_list.len(), 1);
        assert_eq!(pos.chk_list.len(), 1);
        assert_eq!(pos.distance, 0);
    }

    #[test]
    fn test_from_fen_initial_pos() {
        let mut pos = Position::new();
        let initial_fen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
        assert!(pos.from_fen(initial_fen));
        assert_eq!(pos.to_fen(), "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w");
        assert_eq!(pos.sd_player, 0); // 'w' side
    }

    #[test]
    fn test_from_fen_black_to_move() {
        let mut pos = Position::new();
        let fen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR b - - 0 1";
        assert!(pos.from_fen(fen));
        assert_eq!(pos.sd_player, 1); // 'b' side
    }

    #[test]
    fn test_make_and_undo_move_red_pawn_move() {
        let mut pos = Position::new();
        let initial_fen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
        pos.from_fen(initial_fen);
        
        // Red Pawn (P1) from A3 (coord_xy(3, 9)) to A4 (coord_xy(3, 8))
        let mv = make_move(coord_xy(3, 9), coord_xy(3, 8)); 

        let old_fen = pos.to_fen();
        let old_sd_player = pos.sd_player;
        let old_mv_list_len = pos.mv_list.len();
        let old_pc_list_len = pos.pc_list.len();
        let old_key_list_len = pos.key_list.len();
        let old_chk_list_len = pos.chk_list.len();
        let old_distance = pos.distance;

        assert!(pos.make_move(mv));
        assert_ne!(pos.to_fen(), old_fen);
        assert_ne!(pos.sd_player, old_sd_player); 
        assert_eq!(pos.mv_list.len(), old_mv_list_len + 1);
        assert_eq!(pos.pc_list.len(), old_pc_list_len + 1);
        assert_eq!(pos.key_list.len(), old_key_list_len + 1);
        assert_eq!(pos.chk_list.len(), old_chk_list_len + 1);
        assert_eq!(pos.distance, old_distance + 1);

        pos.undo_make_move();
        assert_eq!(pos.to_fen(), old_fen);
        assert_eq!(pos.sd_player, old_sd_player); 
        assert_eq!(pos.mv_list.len(), old_mv_list_len);
        assert_eq!(pos.pc_list.len(), old_pc_list_len);
        assert_eq!(pos.key_list.len(), old_key_list_len);
        assert_eq!(pos.chk_list.len(), old_chk_list_len);
        assert_eq!(pos.distance, old_distance);
    }

    #[test]
    fn test_red_king_check_by_black_rook() {
        let mut pos = Position::new();
        // Custom FEN: Red King at middle of fort, Black Rook attacks
        let fen = "4k4/9/9/9/9/9/9/9/4K4/R8 b - - 0 1"; // Black Rook at A0, Red King at E0
        pos.from_fen(fen);
        // Move black rook to A9 to check Red King
        let check_move = make_move(coord_xy(3, 3), coord_xy(3, 9)); // Black Rook (3,3) -> (3,9)
        assert!(pos.make_move(check_move));
        assert!(pos.checked());
    }

    #[test]
    fn test_is_mate_no_moves() {
        let mut pos = Position::new();
        // A mate position (example: king has no moves and is in check)
        let mate_fen = "4k4/4a4/3P5/9/9/9/9/9/4K4/9 w - - 0 1"; // Simplified mate for red
        pos.from_fen(mate_fen);
        assert!(pos.checked()); // King should be in check
        assert!(pos.is_mate()); // Should be mate
    }

    #[test]
    fn test_is_mate_has_moves() {
        let mut pos = Position::new();
        let fen = "4k4/9/9/9/9/9/9/9/4K4/9 w - - 0 1"; // Red King can move
        pos.from_fen(fen);
        assert!(!pos.is_mate());
    }

    #[test]
    fn test_legal_move_basic() {
        let mut pos = Position::new();
        let initial_fen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
        pos.from_fen(initial_fen);

        // Legal Red Pawn move: P1 (coord_xy(3,9)) to (coord_xy(3,8))
        let legal_pawn_move = make_move(coord_xy(3, 9), coord_xy(3, 8));
        assert!(pos.legal_move(legal_pawn_move));

        // Illegal move: Red King to (coord_xy(3,8)) (out of fort)
        let illegal_king_move = make_move(coord_xy(7, 12), coord_xy(3, 8)); // King to pawn start
        assert!(!pos.legal_move(illegal_king_move));

        // Illegal move: Move opponent's piece
        let illegal_move_opp = make_move(coord_xy(7,3), coord_xy(7,4)); // Black King (7,3) to (7,4)
        assert!(!pos.legal_move(illegal_move_opp));
    }
}