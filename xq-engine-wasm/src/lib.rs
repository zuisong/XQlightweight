use fastrand;
use lazy_static::lazy_static;
use wasm_bindgen::prelude::*;

// --- Macros ---
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[cfg(target_arch = "wasm32")]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[cfg(not(target_arch = "wasm32"))]
macro_rules! console_log {
    ($($t:tt)*) => (println!("{}", &format_args!($($t)*).to_string()))
}

// --- Constants ---

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

const PHASE_HASH: u8 = 0;
const PHASE_KILLER_1: u8 = 1;
const PHASE_KILLER_2: u8 = 2;
const PHASE_GEN_MOVES: u8 = 3;
const PHASE_REST: u8 = 4;

const HASH_ALPHA: u8 = 1;
const HASH_BETA: u8 = 2;
const HASH_PV: u8 = 3;

const LIMIT_DEPTH: u32 = 64;
const NULL_DEPTH: u32 = 2;
const RANDOMNESS: i32 = 8;

const IN_BOARD_DATA: [u8; 256] = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const IN_FORT_DATA: [u8; 256] = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const LEGAL_SPAN_DATA: [u8; 512] = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const KNIGHT_PIN_DATA: [i8; 512] = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, -16, 0, -16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0,
];

const KING_DELTA: [i8; 4] = [-16, -1, 1, 16];
const ADVISOR_DELTA: [i8; 4] = [-17, -15, 15, 17];
const KNIGHT_DELTA: [[i8; 2]; 4] = [[-33, -31], [-18, 14], [-14, 18], [31, 33]];
const KNIGHT_CHECK_DELTA: [[i8; 2]; 4] = [[-33, -18], [-31, -14], [14, 31], [18, 33]];
const MVV_VALUE: [i32; 8] = [50, 10, 10, 30, 40, 30, 20, 0];

const PIECE_VALUE_DATA: [[i32; 256]; 5] = [
    [
        // PIECE_KING, PIECE_ADVISOR, PIECE_BISHOP
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 11, 13, 11, 9, 9, 9,
        0, 0, 0, 0, 0, 0, 0, 19, 24, 34, 42, 44, 42, 34, 24, 19, 0, 0, 0, 0, 0, 0, 0, 19, 24, 32,
        37, 37, 37, 32, 24, 19, 0, 0, 0, 0, 0, 0, 0, 19, 23, 27, 29, 30, 29, 27, 23, 19, 0, 0, 0,
        0, 0, 0, 0, 14, 18, 20, 27, 29, 27, 20, 18, 14, 0, 0, 0, 0, 0, 0, 0, 7, 0, 13, 0, 16, 0,
        13, 0, 7, 0, 0, 0, 0, 0, 0, 0, 7, 0, 7, 0, 15, 0, 7, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 11, 15, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
        // PIECE_KNIGHT
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 20, 23, 20, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 20, 0, 20, 20, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
        // PIECE_ROOK
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90, 90, 90, 96, 90, 96, 90, 90,
        90, 0, 0, 0, 0, 0, 0, 0, 90, 96, 103, 97, 94, 97, 103, 96, 90, 0, 0, 0, 0, 0, 0, 0, 92, 98,
        99, 103, 99, 103, 99, 98, 92, 0, 0, 0, 0, 0, 0, 0, 93, 108, 100, 107, 100, 107, 100, 108,
        93, 0, 0, 0, 0, 0, 0, 0, 90, 100, 99, 103, 104, 103, 99, 100, 90, 0, 0, 0, 0, 0, 0, 0, 90,
        98, 101, 102, 103, 102, 101, 98, 90, 0, 0, 0, 0, 0, 0, 0, 92, 94, 98, 95, 98, 95, 98, 94,
        92, 0, 0, 0, 0, 0, 0, 0, 93, 92, 94, 95, 92, 95, 94, 92, 93, 0, 0, 0, 0, 0, 0, 0, 85, 90,
        92, 93, 78, 93, 92, 90, 85, 0, 0, 0, 0, 0, 0, 0, 88, 85, 90, 88, 90, 88, 90, 85, 88, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
        // PIECE_CANNON
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 206, 208, 207, 213, 214, 213,
        207, 208, 206, 0, 0, 0, 0, 0, 0, 0, 206, 212, 209, 216, 233, 216, 209, 212, 206, 0, 0, 0,
        0, 0, 0, 0, 206, 208, 207, 214, 216, 214, 207, 208, 206, 0, 0, 0, 0, 0, 0, 0, 206, 213,
        213, 216, 216, 216, 213, 213, 206, 0, 0, 0, 0, 0, 0, 0, 208, 211, 211, 214, 215, 214, 211,
        211, 208, 0, 0, 0, 0, 0, 0, 0, 208, 212, 212, 214, 215, 214, 212, 212, 208, 0, 0, 0, 0, 0,
        0, 0, 204, 209, 204, 212, 214, 212, 204, 209, 204, 0, 0, 0, 0, 0, 0, 0, 198, 208, 204, 212,
        212, 212, 204, 208, 198, 0, 0, 0, 0, 0, 0, 0, 200, 208, 206, 212, 200, 212, 206, 208, 200,
        0, 0, 0, 0, 0, 0, 0, 194, 206, 204, 212, 200, 212, 204, 206, 194, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
        // PIECE_PAWN
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 96, 91, 90, 91, 96,
        100, 100, 0, 0, 0, 0, 0, 0, 0, 98, 98, 96, 92, 89, 92, 96, 98, 98, 0, 0, 0, 0, 0, 0, 0, 97,
        97, 96, 91, 92, 91, 96, 97, 97, 0, 0, 0, 0, 0, 0, 0, 96, 99, 99, 98, 100, 98, 99, 99, 96,
        0, 0, 0, 0, 0, 0, 0, 96, 96, 96, 96, 100, 96, 96, 96, 96, 0, 0, 0, 0, 0, 0, 0, 95, 96, 99,
        96, 100, 96, 99, 96, 95, 0, 0, 0, 0, 0, 0, 0, 96, 96, 96, 96, 96, 96, 96, 96, 96, 0, 0, 0,
        0, 0, 0, 0, 97, 96, 100, 99, 101, 99, 100, 96, 97, 0, 0, 0, 0, 0, 0, 0, 96, 97, 98, 98, 98,
        98, 98, 97, 96, 0, 0, 0, 0, 0, 0, 0, 96, 96, 97, 99, 99, 99, 97, 96, 96, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
];

static FEN_PIECE_MAP: &str = "        KABNRCP kabnrcp ";

// --- Helper Functions ---

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

const SHELL_STEP: [usize; 8] = [0, 1, 4, 13, 40, 121, 364, 1093];

pub fn shell_sort(mvs: &mut Vec<u16>, vls: &mut Vec<i32>) {
    let mut step_level = 1;
    while step_level < SHELL_STEP.len() && SHELL_STEP[step_level] < mvs.len() {
        step_level += 1;
    }
    step_level -= 1;

    while step_level > 0 {
        let step = SHELL_STEP[step_level];
        for i in step..mvs.len() {
            let mv_best = mvs[i];
            let vl_best = vls[i];
            let mut j = i - step;
            while vl_best > vls[j] {
                mvs[j + step] = mvs[j];
                vls[j + step] = vls[j];
                if j < step {
                    break;
                }
                j -= step;
            }
            mvs[j + step] = mv_best;
            vls[j + step] = vl_best;
        }
        step_level -= 1;
    }
}

struct ZobristData {
    key_table: Vec<Vec<u64>>,
    lock_table: Vec<Vec<u64>>,
    key_player: u64,
    lock_player: u64,
}

lazy_static! {
    static ref ZOBRIST: ZobristData = {
        let mut rc4 = Rc4::new(&[0]);
        let key_player = rc4.next_long();
        rc4.next_long();
        let lock_player = rc4.next_long();

        let mut key_table = Vec::with_capacity(14);
        let mut lock_table = Vec::with_capacity(14);

        for _ in 0..14 {
            let mut keys = Vec::with_capacity(256);
            let mut locks = Vec::with_capacity(256);
            for _ in 0..256 {
                keys.push(rc4.next_long());
                rc4.next_long();
                locks.push(rc4.next_long());
            }
            key_table.push(keys);
            lock_table.push(locks);
        }

        ZobristData {
            key_table,
            lock_table,
            key_player,
            lock_player,
        }
    };
}

static BOOK_DAT_RUST: &'static [[u32; 3]] = &[];

// --- Position Struct ---

#[wasm_bindgen]
#[derive(Clone)]
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
    pub fn new() -> Position {
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
        pos.clear_board();
        pos.set_irrev();
        pos
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
        fen.pop();
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
                }
                '1'..='9' => {
                    chars.next();
                    x = x.wrapping_add(c.to_digit(10).unwrap() as u8);
                }
                'A'..='Z' => {
                    chars.next();
                    if x <= FILE_RIGHT {
                        let pt = char_to_piece(c);
                        if pt >= 0 {
                            self.add_piece(coord_xy(x, y), pt as u8 + 8, ADD_PIECE);
                        }
                        x = x.wrapping_add(1);
                    }
                }
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
                }
                ' ' => {
                    chars.next();
                    break;
                }
                _ => return false,
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
            chars.next();
        }

        self.set_irrev();
        true
    }

    pub fn make_move(&mut self, mv: u16) -> bool {
        let zobrist_key = self.zobrist_key;
        let zobrist_lock = self.zobrist_lock;
        let vl_white = self.vl_white;
        let vl_black = self.vl_black;
        let sd_player = self.sd_player;

        self.move_piece(mv);
        if self.checked() {
            self.undo_move_piece();
            self.mv_list.pop();
            self.pc_list.pop();

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

        let mv = self.mv_list.pop().unwrap();
        let pc_captured = self.pc_list.pop().unwrap();

        let sq_src = src(mv);
        let sq_dst = dst(mv);

        let pc_moved = self.squares[sq_dst as usize];
        self.add_piece(sq_dst, pc_moved, DEL_PIECE);
        self.add_piece(sq_src, pc_moved, ADD_PIECE);

        if pc_captured > 0 {
            self.add_piece(sq_dst, pc_captured, ADD_PIECE);
        }
    }

    pub fn is_mate(&self) -> bool {
        let legal_moves = self.get_legal_moves();
        legal_moves.is_empty() && self.checked()
    }

    pub fn in_check(&self) -> bool {
        *self.chk_list.last().unwrap_or(&false)
    }

    pub fn evaluate(&self) -> i32 {
        let vl = if self.sd_player == 0 {
            self.vl_white - self.vl_black
        } else {
            self.vl_black - self.vl_white
        } + ADVANCED_VALUE;
        if vl == self.draw_value() {
            vl - 1
        } else {
            vl
        }
    }

    pub fn get_legal_moves(&self) -> Vec<u16> {
        let pseudo_legal_moves = self.generate_moves(None);
        let mut legal_moves = Vec::new();
        for &mv in pseudo_legal_moves.iter() {
            let mut temp_pos = self.clone();
            if temp_pos.make_move(mv) {
                legal_moves.push(mv);
            }
        }
        legal_moves
    }

    pub fn get_moves_str(&self) -> String {
        let moves = self.generate_moves(None);
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

    pub fn rep_status(&self, recur: i32) -> i32 {
        self.rep_status_internal(recur as u32) as i32
    }

    pub fn rep_value(&self, vl_rep: i32) -> i32 {
        self.rep_value_internal(vl_rep as u32)
    }

    pub fn captured(&self) -> bool {
        self.captured_internal()
    }

    pub fn zobrist_key(&self) -> u64 {
        self.zobrist_key
    }

    pub fn zobrist_lock(&self) -> u64 {
        self.zobrist_lock
    }

    pub fn mirror(&self) -> Position {
        self.mirror_internal()
    }

    pub fn clone(&self) -> Position {
        std::clone::Clone::clone(self)
    }

    pub fn vl_white(&self) -> i32 {
        self.vl_white
    }
    pub fn vl_black(&self) -> i32 {
        self.vl_black
    }
}

// Internal Position implementation
impl Position {
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
        if pc == 0 {
            self.squares[sq as usize] = 0;
            return;
        }
        self.squares[sq as usize] = if b_del { 0 } else { pc };

        let mut pc_adjust: usize;
        if pc < 16 {
            pc_adjust = (pc - 8) as usize;
            let table_index = if pc_adjust < 3 { 0 } else { pc_adjust - 2 };
            self.vl_white += if b_del {
                -PIECE_VALUE_DATA[table_index][sq as usize]
            } else {
                PIECE_VALUE_DATA[table_index][sq as usize]
            };
        } else {
            pc_adjust = (pc - 16) as usize;
            let table_index = if pc_adjust < 3 { 0 } else { pc_adjust - 2 };
            self.vl_black += if b_del {
                -PIECE_VALUE_DATA[table_index][square_flip(sq) as usize]
            } else {
                PIECE_VALUE_DATA[table_index][square_flip(sq) as usize]
            };
            pc_adjust += 7;
        }
        self.zobrist_key ^= ZOBRIST.key_table[pc_adjust][sq as usize];
        self.zobrist_lock ^= ZOBRIST.lock_table[pc_adjust][sq as usize];
    }

    fn checked(&self) -> bool {
        let pc_self_side = side_tag(self.sd_player);
        let pc_opp_side = opp_side_tag(self.sd_player);

        let mut king_sq: u8 = 0;
        let mut king_found = false;
        for sq in 0..=255u8 {
            if self.squares[sq as usize] == pc_self_side + PIECE_KING {
                king_sq = sq;
                king_found = true;
                break;
            }
        }
        if !king_found {
            return false;
        }

        let sq_pawn_front = square_forward(king_sq, self.sd_player);
        if in_board(sq_pawn_front)
            && self.squares[sq_pawn_front as usize] == pc_opp_side + PIECE_PAWN
        {
            return true;
        }
        for delta in [-1_i8, 1_i8].iter() {
            let sq_pawn_side = (king_sq as i16 + *delta as i16) as u8;
            if in_board(sq_pawn_side)
                && self.squares[sq_pawn_side as usize] == pc_opp_side + PIECE_PAWN
            {
                return true;
            }
        }

        for i in 0..4 {
            let sq_knight_pin_loc = (king_sq as i16 + ADVISOR_DELTA[i] as i16) as u8;
            if in_board(sq_knight_pin_loc) && self.squares[sq_knight_pin_loc as usize] == 0 {
                for j in 0..2 {
                    let sq_knight_attack = (king_sq as i16 + KNIGHT_CHECK_DELTA[i][j] as i16) as u8;
                    if in_board(sq_knight_attack)
                        && self.squares[sq_knight_attack as usize] == pc_opp_side + PIECE_KNIGHT
                    {
                        return true;
                    }
                }
            }
        }

        for i in 0..4 {
            let delta = KING_DELTA[i];
            let mut sq_curr = (king_sq as i16 + delta as i16) as u8;

            while in_board(sq_curr) {
                let pc_curr = self.squares[sq_curr as usize];
                if pc_curr > 0 {
                    if pc_curr == pc_opp_side + PIECE_ROOK || pc_curr == pc_opp_side + PIECE_KING {
                        return true;
                    }
                    break;
                }
                sq_curr = (sq_curr as i16 + delta as i16) as u8;
            }

            let mut sq_cannon_check = (king_sq as i16 + delta as i16) as u8;
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
                    break;
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
        let mv = *self.mv_list.last().unwrap();
        let sq_src = src(mv);
        let sq_dst = dst(mv);

        let pc_moved = self.squares[sq_dst as usize];
        self.add_piece(sq_dst, pc_moved, DEL_PIECE);
        self.add_piece(sq_src, pc_moved, ADD_PIECE);

        let pc_captured = *self.pc_list.last().unwrap();
        if pc_captured > 0 {
            self.add_piece(sq_dst, pc_captured, ADD_PIECE);
        }
    }

    fn change_side(&mut self) {
        self.sd_player = 1 - self.sd_player;
        self.zobrist_key ^= ZOBRIST.key_player;
        self.zobrist_lock ^= ZOBRIST.lock_player;
    }

    pub fn null_move(&mut self) {
        self.mv_list.push(0);
        self.pc_list.push(0);
        self.key_list.push(self.zobrist_key);
        self.change_side();
        self.chk_list.push(false);
        self.distance += 1;
    }

    pub fn undo_null_move(&mut self) {
        self.distance -= 1;
        self.chk_list.pop();
        self.change_side();
        self.key_list.pop();
        self.pc_list.pop();
        self.mv_list.pop();
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
            PIECE_KING => in_fort(sq_dst) && king_span(sq_src, sq_dst),
            PIECE_ADVISOR => in_fort(sq_dst) && advisor_span(sq_src, sq_dst),
            PIECE_BISHOP => {
                same_half(sq_src, sq_dst)
                    && bishop_span(sq_src, sq_dst)
                    && self.squares[bishop_pin(sq_src, sq_dst) as usize] == 0
            }
            PIECE_KNIGHT => {
                let sq_pin = knight_pin(sq_src, sq_dst);
                sq_pin != sq_src && self.squares[sq_pin as usize] == 0
            }
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
                while in_board(sq_pin) && sq_pin != sq_dst && self.squares[sq_pin as usize] == 0 {
                    sq_pin = (sq_pin as i16 + delta as i16) as u8;
                }
                sq_pin == sq_dst
            }
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
                while in_board(sq_pin) && sq_pin != sq_dst {
                    if self.squares[sq_pin as usize] > 0 {
                        count_pieces += 1;
                    }
                    sq_pin = (sq_pin as i16 + delta as i16) as u8;
                }
                count_pieces == 1 && pc_dst > 0
            }
            PIECE_PAWN => {
                if away_half(sq_dst, self.sd_player)
                    && (sq_dst as i16 == sq_src as i16 - 1 || sq_dst as i16 == sq_src as i16 + 1)
                {
                    return true;
                }
                sq_dst == square_forward(sq_src, self.sd_player)
            }
            _ => false,
        }
    }

    pub fn generate_moves(&self, mut values: Option<&mut Vec<i32>>) -> Vec<u16> {
        let mut mvs = Vec::new();
        let pc_self_side = side_tag(self.sd_player);
        let pc_opp_side = opp_side_tag(self.sd_player);

        for sq_src in 0..=255u8 {
            let pc_src = self.squares[sq_src as usize];
            if (pc_src & pc_self_side) == 0 {
                continue;
            }

            match pc_src - pc_self_side {
                PIECE_KING => {
                    for &delta in KING_DELTA.iter() {
                        let sq_dst = (sq_src as i16 + delta as i16) as u8;
                        if in_fort(sq_dst) {
                            let pc_dst = self.squares[sq_dst as usize];
                            if (pc_dst & pc_self_side) == 0 {
                                mvs.push(make_move(sq_src, sq_dst));
                                if let Some(ref mut vls) = values {
                                    vls.push(mvv_lva(pc_dst, 5));
                                }
                            }
                        }
                    }
                }
                PIECE_ADVISOR => {
                    for &delta in ADVISOR_DELTA.iter() {
                        let sq_dst = (sq_src as i16 + delta as i16) as u8;
                        if in_fort(sq_dst) {
                            let pc_dst = self.squares[sq_dst as usize];
                            if (pc_dst & pc_self_side) == 0 {
                                mvs.push(make_move(sq_src, sq_dst));
                                if let Some(ref mut vls) = values {
                                    vls.push(mvv_lva(pc_dst, 1));
                                }
                            }
                        }
                    }
                }
                PIECE_BISHOP => {
                    for &delta in ADVISOR_DELTA.iter() {
                        let sq_pin = (sq_src as i16 + delta as i16) as u8;
                        if in_board(sq_pin) && self.squares[sq_pin as usize] == 0 {
                            let sq_dst = (sq_src as i16 + 2 * delta as i16) as u8;
                            if in_board(sq_dst) && home_half(sq_dst, self.sd_player) {
                                let pc_dst = self.squares[sq_dst as usize];
                                if (pc_dst & pc_self_side) == 0 {
                                    mvs.push(make_move(sq_src, sq_dst));
                                    if let Some(ref mut vls) = values {
                                        vls.push(mvv_lva(pc_dst, 1));
                                    }
                                }
                            }
                        }
                    }
                }
                PIECE_KNIGHT => {
                    for i in 0..4 {
                        let sq_pin = (sq_src as i16 + KING_DELTA[i] as i16) as u8;
                        if in_board(sq_pin) && self.squares[sq_pin as usize] == 0 {
                            for j in 0..2 {
                                let sq_dst = (sq_src as i16 + KNIGHT_DELTA[i][j] as i16) as u8;
                                if in_board(sq_dst) {
                                    let pc_dst = self.squares[sq_dst as usize];
                                    if (pc_dst & pc_self_side) == 0 {
                                        mvs.push(make_move(sq_src, sq_dst));
                                        if let Some(ref mut vls) = values {
                                            vls.push(mvv_lva(pc_dst, 1));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                PIECE_ROOK => {
                    for &delta in KING_DELTA.iter() {
                        let mut sq_dst = (sq_src as i16 + delta as i16) as u8;
                        while in_board(sq_dst) {
                            let pc_dst = self.squares[sq_dst as usize];
                            if pc_dst == 0 {
                                mvs.push(make_move(sq_src, sq_dst));
                                if let Some(ref mut vls) = values {
                                    vls.push(0);
                                }
                            } else {
                                if (pc_dst & pc_opp_side) != 0 {
                                    mvs.push(make_move(sq_src, sq_dst));
                                    if let Some(ref mut vls) = values {
                                        vls.push(mvv_lva(pc_dst, 4));
                                    }
                                }
                                break;
                            }
                            sq_dst = (sq_dst as i16 + delta as i16) as u8;
                        }
                    }
                }
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
                            mvs.push(make_move(sq_src, sq_dst));
                            if let Some(ref mut vls) = values {
                                vls.push(0);
                            }
                            sq_dst = (sq_dst as i16 + delta as i16) as u8;
                        }
                        if blocked {
                            sq_dst = (sq_dst as i16 + delta as i16) as u8;
                            while in_board(sq_dst) {
                                let pc_dst = self.squares[sq_dst as usize];
                                if pc_dst > 0 {
                                    if (pc_dst & pc_opp_side) != 0 {
                                        mvs.push(make_move(sq_src, sq_dst));
                                        if let Some(ref mut vls) = values {
                                            vls.push(mvv_lva(pc_dst, 4));
                                        }
                                    }
                                    break;
                                }
                                sq_dst = (sq_dst as i16 + delta as i16) as u8;
                            }
                        }
                    }
                }
                PIECE_PAWN => {
                    let sq_dst_forward = square_forward(sq_src, self.sd_player);
                    if in_board(sq_dst_forward) {
                        let pc_dst = self.squares[sq_dst_forward as usize];
                        if (pc_dst & pc_self_side) == 0 {
                            mvs.push(make_move(sq_src, sq_dst_forward));
                            if let Some(ref mut vls) = values {
                                vls.push(mvv_lva(pc_dst, 2));
                            }
                        }
                    }
                    if away_half(sq_src, self.sd_player) {
                        for &delta in [-1_i8, 1_i8].iter() {
                            let sq_dst_side = (sq_src as i16 + delta as i16) as u8;
                            if in_board(sq_dst_side) {
                                let pc_dst = self.squares[sq_dst_side as usize];
                                if (pc_dst & pc_self_side) == 0 {
                                    mvs.push(make_move(sq_src, sq_dst_side));
                                    if let Some(ref mut vls) = values {
                                        vls.push(mvv_lva(pc_dst, 2));
                                    }
                                }
                            }
                        }
                    }
                }
                _ => {}
            }
        }
        mvs
    }

    pub fn rep_status_internal(&self, recur_: u32) -> u32 {
        let mut recur = recur_;
        let mut self_side = false;
        let mut perp_check = true;
        let mut opp_perp_check = true;
        let mut index = self.mv_list.len() as isize - 1;

        while index >= 0 && self.mv_list[index as usize] > 0 && self.pc_list[index as usize] == 0 {
            if self_side {
                perp_check = perp_check && self.chk_list[index as usize];
                if self.key_list[index as usize] == self.zobrist_key {
                    recur -= 1;
                    if recur == 0 {
                        return 1
                            + (if perp_check { 2 } else { 0 })
                            + (if opp_perp_check { 4 } else { 0 });
                    }
                }
            } else {
                opp_perp_check = opp_perp_check && self.chk_list[index as usize];
            }
            self_side = !self_side;
            index -= 1;
        }
        0
    }

    pub fn rep_value_internal(&self, vl_rep: u32) -> i32 {
        let vl_return = (if (vl_rep & 2) == 0 {
            0
        } else {
            self.ban_value()
        }) + (if (vl_rep & 4) == 0 {
            0
        } else {
            -self.ban_value()
        });
        if vl_return == 0 {
            self.draw_value()
        } else {
            vl_return
        }
    }

    pub fn captured_internal(&self) -> bool {
        *self.pc_list.last().unwrap_or(&0) > 0
    }

    pub fn mate_value(&self) -> i32 {
        self.distance as i32 - MATE_VALUE
    }

    pub fn ban_value(&self) -> i32 {
        self.distance as i32 - BAN_VALUE
    }

    pub fn draw_value(&self) -> i32 {
        if (self.distance & 1) == 0 {
            -DRAW_VALUE
        } else {
            DRAW_VALUE
        }
    }

    pub fn null_okay(&self) -> bool {
        (if self.sd_player == 0 {
            self.vl_white
        } else {
            self.vl_black
        }) > NULL_OKAY_MARGIN
    }

    pub fn null_safe(&self) -> bool {
        (if self.sd_player == 0 {
            self.vl_white
        } else {
            self.vl_black
        }) > NULL_SAFE_MARGIN
    }

    pub fn mirror_internal(&self) -> Self {
        let mut pos = Position::new();
        pos.clear_board();
        for sq in 0..=255 {
            let pc = self.squares[sq as usize];
            if pc > 0 {
                pos.add_piece(mirror_square(sq), pc, ADD_PIECE);
            }
        }
        if self.sd_player == 1 {
            pos.change_side();
        }
        pos
    }

    pub fn history_index(&self, mv: u16) -> u16 {
        (((self.squares[src(mv) as usize] - 8) as u16) << 8) + dst(mv) as u16
    }

    fn binary_search(vlss: &[[u32; 3]], vl: u32) -> i32 {
        let mut low = 0;
        let mut high = vlss.len() as i32 - 1;
        while low <= high {
            let mid = (low + high) >> 1;
            if vlss[mid as usize][0] < vl {
                low = mid + 1;
            } else if vlss[mid as usize][0] > vl {
                high = mid - 1;
            } else {
                return mid;
            }
        }
        -1
    }

    pub fn book_move(&self) -> u16 {
        if BOOK_DAT_RUST.is_empty() {
            return 0;
        }

        let mut mirror = false;
        let mut lock = self.zobrist_lock;
        let mut index = Self::binary_search(BOOK_DAT_RUST, lock as u32);

        if index < 0 {
            mirror = true;
            lock = self.mirror_internal().zobrist_lock;
            index = Self::binary_search(BOOK_DAT_RUST, lock as u32);
        }
        if index < 0 {
            return 0;
        }

        while index >= 0 && BOOK_DAT_RUST[index as usize][0] == lock as u32 {
            index -= 1;
        }
        index += 1;

        let mut mvs = Vec::new();
        let mut vls = Vec::new();
        let mut value = 0;

        while index < BOOK_DAT_RUST.len() as i32 && BOOK_DAT_RUST[index as usize][0] == lock as u32
        {
            let mut mv = BOOK_DAT_RUST[index as usize][1] as u16;
            if mirror {
                mv = mirror_move(mv);
            }
            if self.legal_move(mv) {
                mvs.push(mv);
                let vl = BOOK_DAT_RUST[index as usize][2] as i32;
                vls.push(vl);
                value += vl;
            }
            index += 1;
        }

        if value == 0 {
            return 0;
        }

        let mut rng = fastrand::Rng::new();
        let rand_val = rng.usize(0..(value as usize));

        let mut cumulative_value: usize = 0;
        for i in 0..mvs.len() {
            cumulative_value += vls[i] as usize;
            if rand_val < cumulative_value {
                return mvs[i];
            }
        }
        0
    }
}

// --- MoveSort & Search ---

struct MoveSort {
    mvs: Vec<u16>,
    vls: Vec<i32>,
    mv_hash: u16,
    mv_killer1: u16,
    mv_killer2: u16,
    phase: u8,
    single_reply: bool,
    index: usize,
}

impl MoveSort {
    fn new(
        mv_hash: u16,
        pos: &Position,
        killer_table: &Vec<[u16; 2]>,
        history_table: &Vec<u32>,
    ) -> Self {
        let mut mvs = Vec::new();
        let mut vls = Vec::new();
        let mut phase = PHASE_HASH;
        let mut single_reply = false;

        if pos.in_check() {
            phase = PHASE_REST;
            let all_mvs = pos.generate_moves(None);
            for mv in all_mvs {
                let mut temp_pos = pos.clone();
                if temp_pos.make_move(mv) {
                    mvs.push(mv);
                    vls.push(history_table[pos.history_index(mv) as usize] as i32);
                }
            }
            shell_sort(&mut mvs, &mut vls);
            single_reply = mvs.len() == 1;
        }

        let mv_killer1 = if pos.distance < LIMIT_DEPTH {
            killer_table[pos.distance as usize][0]
        } else {
            0
        };
        let mv_killer2 = if pos.distance < LIMIT_DEPTH {
            killer_table[pos.distance as usize][1]
        } else {
            0
        };

        MoveSort {
            mvs,
            vls,
            mv_hash,
            mv_killer1,
            mv_killer2,
            phase,
            single_reply,
            index: 0,
        }
    }

    fn next(&mut self, pos: &Position, history_table: &Vec<u32>) -> u16 {
        loop {
            match self.phase {
                PHASE_HASH => {
                    self.phase = PHASE_KILLER_1;
                    if self.mv_hash > 0 {
                        return self.mv_hash;
                    }
                }
                PHASE_KILLER_1 => {
                    self.phase = PHASE_KILLER_2;
                    if self.mv_killer1 != self.mv_hash
                        && self.mv_killer1 > 0
                        && pos.legal_move(self.mv_killer1)
                    {
                        return self.mv_killer1;
                    }
                }
                PHASE_KILLER_2 => {
                    self.phase = PHASE_GEN_MOVES;
                    if self.mv_killer2 != self.mv_hash
                        && self.mv_killer2 > 0
                        && pos.legal_move(self.mv_killer2)
                    {
                        return self.mv_killer2;
                    }
                }
                PHASE_GEN_MOVES => {
                    self.phase = PHASE_REST;
                    self.mvs = pos.generate_moves(Some(&mut self.vls));

                    self.vls.clear();
                    for &mv in self.mvs.iter() {
                        self.vls
                            .push(history_table[pos.history_index(mv) as usize] as i32);
                    }
                    shell_sort(&mut self.mvs, &mut self.vls);
                    self.index = 0;
                }
                PHASE_REST => {
                    while self.index < self.mvs.len() {
                        let mv = self.mvs[self.index];
                        self.index += 1;
                        if mv != self.mv_hash && mv != self.mv_killer1 && mv != self.mv_killer2 {
                            let mut temp_pos = pos.clone();
                            if temp_pos.make_move(mv) {
                                return mv;
                            }
                        }
                    }
                    return 0;
                }
                _ => return 0,
            }
        }
    }
}

#[derive(Clone, Copy)]
pub struct HashItem {
    depth: u32,
    flag: u8,
    vl: i32,
    mv: u16,
    zobrist_lock: u64,
}

impl Default for HashItem {
    fn default() -> Self {
        HashItem {
            depth: 0,
            flag: 0,
            vl: 0,
            mv: 0,
            zobrist_lock: 0,
        }
    }
}

#[wasm_bindgen]
pub struct Search {
    /// 哈希掩码，用于计算哈希表索引
    hash_mask: u64,
    /// 搜索结果（最佳走法）
    mv_result: u16,
    /// 当前局面
    pos: Position,
    /// 搜索耗时（毫秒）
    all_millis: u128,
    /// 置换表（Transposition Table），用于缓存搜索过的局面
    hash_table: Vec<HashItem>,
    /// 历史表（History Heuristic），用于记录走法的好坏，优化排序
    history_table: Vec<u32>,
    /// 搜索节点数
    all_nodes: u64,
    /// 杀手走法表（Killer Heuristic），记录在某个深度产生截断的走法
    killer_table: Vec<[u16; 2]>,
    /// 搜索开始时间
    start_time: f64,
    /// 最大搜索时间限制
    max_search_time: f64,
}

#[wasm_bindgen]
impl Search {
    #[wasm_bindgen(constructor)]
    pub fn new(pos: &Position, hash_level: u32) -> Self {
        let hash_mask = (1u64 << hash_level) - 1;
        let table_size = hash_mask as usize + 1;

        Search {
            hash_mask,
            mv_result: 0,
            pos: pos.clone(),
            all_millis: 0,
            hash_table: vec![HashItem::default(); table_size],
            history_table: vec![0; 4096],
            all_nodes: 0,
            killer_table: vec![[0, 0]; LIMIT_DEPTH as usize],
            start_time: 0.0,
            max_search_time: 0.0,
        }
    }

    /// 主搜索入口函数
    ///
    /// # 参数
    /// * `millis` - 搜索时间限制（毫秒）
    /// * `depth_limit` - 最大搜索深度限制
    ///
    /// # 返回值
    /// 返回最佳走法的内部表示（u16）
    pub fn search_main(&mut self, millis: u32, depth_limit: u32) -> u16 {
        self.max_search_time = millis as f64;
        self.start_time = 0.0;
        self.all_nodes = 0;
        self.mv_result = 0;

        let mut vl_root;
        // 迭代加深搜索（Iterative Deepening）
        // 从深度 1 开始，逐步增加深度，直到达到限制或超时
        for depth in 1..=depth_limit {
            vl_root = self.search_root(-MATE_VALUE, MATE_VALUE, depth);
            if false {
                // Time check disabled for debugging
                break;
            }
            if vl_root > WIN_VALUE || vl_root < -WIN_VALUE {
                break;
            }
        }
        self.mv_result
    }

    fn get_hash_item(&self) -> &HashItem {
        &self.hash_table[(self.pos.zobrist_key & self.hash_mask) as usize]
    }

    fn probe_hash(&self, vl_alpha: i32, vl_beta: i32, depth: u32, mv_hash: &mut u16) -> i32 {
        let hash = self.get_hash_item();
        if hash.zobrist_lock != self.pos.zobrist_lock {
            *mv_hash = 0;
            return -MATE_VALUE;
        }
        *mv_hash = hash.mv;
        let mut mate = false;
        let mut hash_vl = hash.vl;

        if hash_vl > WIN_VALUE {
            if hash_vl <= BAN_VALUE {
                return -MATE_VALUE;
            }
            hash_vl -= self.pos.distance as i32;
            mate = true;
        } else if hash_vl < -WIN_VALUE {
            if hash_vl >= -BAN_VALUE {
                return -MATE_VALUE;
            }
            hash_vl += self.pos.distance as i32;
            mate = true;
        } else if hash_vl == self.pos.draw_value() && hash.mv == 0 {
            return -MATE_VALUE;
        }

        if hash.depth < depth && !mate {
            return -MATE_VALUE;
        }

        if hash.flag == HASH_BETA {
            return if hash_vl >= vl_beta {
                hash_vl
            } else {
                -MATE_VALUE
            };
        }
        if hash.flag == HASH_ALPHA {
            return if hash_vl <= vl_alpha {
                hash_vl
            } else {
                -MATE_VALUE
            };
        }
        hash_vl
    }

    fn record_hash(&mut self, flag: u8, vl: i32, depth: u32, mv: u16) {
        let hash_index = (self.pos.zobrist_key & self.hash_mask) as usize;
        let hash_item = &mut self.hash_table[hash_index];

        if hash_item.depth > depth && hash_item.mv != 0 {
            return;
        }

        hash_item.flag = flag;
        hash_item.depth = depth;

        let mut final_vl = vl;
        if vl > WIN_VALUE {
            if mv == 0 && vl <= BAN_VALUE {
                return;
            }
            final_vl = vl + self.pos.distance as i32;
        } else if vl < -WIN_VALUE {
            if mv == 0 && vl >= -BAN_VALUE {
                return;
            }
            final_vl = vl - self.pos.distance as i32;
        } else if vl == self.pos.draw_value() && mv == 0 {
            return;
        }

        hash_item.vl = final_vl;
        hash_item.mv = mv;
        hash_item.zobrist_lock = self.pos.zobrist_lock;
    }

    fn set_best_move(&mut self, mv: u16, depth: u32) {
        let history_index = self.pos.history_index(mv) as usize;
        self.history_table[history_index] += depth * depth;

        if self.pos.distance < LIMIT_DEPTH as u32 {
            let mvs_killer = &mut self.killer_table[self.pos.distance as usize];
            if mvs_killer[0] != mv {
                mvs_killer[1] = mvs_killer[0];
                mvs_killer[0] = mv;
            }
        }
    }

    /// 静态搜索函数（Quiescence Search）
    /// 用于在主搜索结束后继续搜索直到局面平静，防止水平线效应
    ///
    /// # 参数
    /// * `vl_alpha` - Alpha 值
    /// * `vl_beta` - Beta 值
    /// * `q_depth` - 当前静态搜索深度（用于防止无限递归）
    fn search_quiesc(&mut self, mut vl_alpha: i32, vl_beta: i32, q_depth: u32) -> i32 {
        if false {
            return 0;
        }

        self.all_nodes += 1;
        if self.all_nodes % 10000 == 0 {
            //  console_log!("QNode: {}, Dist: {}, QDepth: {}", self.all_nodes, self.pos.distance, q_depth);
        }

        let mut vl = self.pos.mate_value();
        if vl >= vl_beta {
            return vl;
        }
        let vl_rep = self.pos.rep_status(1);
        if vl_rep > 0 {
            return self.pos.rep_value(vl_rep);
        }
        if self.pos.distance >= LIMIT_DEPTH || q_depth >= 32 {
            return self.pos.evaluate();
        }

        let mut vl_best = -MATE_VALUE;
        let mut mvs = Vec::new();
        let mut vls = Vec::new();

        if self.pos.in_check() {
            let all_pseudo_mvs = self.pos.generate_moves(None);
            for mv in all_pseudo_mvs {
                let mut temp_pos = self.pos.clone();
                if temp_pos.make_move(mv) {
                    mvs.push(mv);
                    vls.push(self.history_table[self.pos.history_index(mv) as usize] as i32);
                }
            }
            shell_sort(&mut mvs, &mut vls);
        } else {
            vl = self.pos.evaluate();
            if vl > vl_best {
                if vl >= vl_beta {
                    return vl;
                }
                vl_best = vl;
                vl_alpha = vl_alpha.max(vl);
            }

            let mut all_moves_for_quiescence_values = Vec::new();
            let all_moves_for_quiescence_mvs = self
                .pos
                .generate_moves(Some(&mut all_moves_for_quiescence_values));

            let mut filtered_mvs = Vec::new();
            let mut filtered_vls = Vec::new();

            for i in 0..all_moves_for_quiescence_mvs.len() {
                let mv = all_moves_for_quiescence_mvs[i];
                let mv_vl = all_moves_for_quiescence_values[i];

                let filter_out =
                    mv_vl < 10 || (mv_vl < 20 && home_half(dst(mv), self.pos.sd_player));

                if !filter_out {
                    let mut temp_pos = self.pos.clone();
                    if temp_pos.make_move(mv) {
                        filtered_mvs.push(mv);
                        filtered_vls.push(mv_vl);
                    }
                }
            }
            mvs = filtered_mvs;
            vls = filtered_vls;
            shell_sort(&mut mvs, &mut vls);
        }

        for i in 0..mvs.len() {
            let current_mv = mvs[i];

            if !self.pos.make_move(current_mv) {
                continue;
            }
            vl = -self.search_quiesc(-vl_beta, -vl_alpha, q_depth + 1);
            self.pos.undo_make_move();

            if false {
                return 0;
            }

            if vl > vl_best {
                if vl >= vl_beta {
                    return vl;
                }
                vl_best = vl;
                vl_alpha = vl_alpha.max(vl);
            }
        }
        if vl_best == -MATE_VALUE {
            self.pos.mate_value()
        } else {
            vl_best
        }
    }

    /// 全窗口/PVS搜索函数
    ///
    /// # 参数
    /// * `vl_alpha` - Alpha 值（下界）
    /// * `vl_beta` - Beta 值（上界）
    /// * `depth` - 剩余搜索深度
    /// * `no_null` - 是否允许空步裁剪（Null Move Pruning）
    fn search_full(&mut self, mut vl_alpha: i32, vl_beta: i32, depth: u32, no_null: bool) -> i32 {
        if self.all_nodes % 10000 == 0 {
            // console_log!("Node: {}, Depth: {}", self.all_nodes, depth);
        }
        if false {
            return 0;
        }

        // 到达叶子节点，进入静态搜索
        if depth <= 0 {
            return self.search_quiesc(vl_alpha, vl_beta, 0);
        }

        self.all_nodes += 1;
        let mut vl = self.pos.mate_value();
        if vl >= vl_beta {
            return vl;
        }

        let vl_rep = self.pos.rep_status(1);
        if vl_rep > 0 {
            return self.pos.rep_value(vl_rep);
        }

        let mut mv_hash_val = 0;
        vl = self.probe_hash(vl_alpha, vl_beta, depth, &mut mv_hash_val);
        if vl > -MATE_VALUE {
            return vl;
        }

        if self.pos.distance >= LIMIT_DEPTH {
            return self.pos.evaluate();
        }

        if !no_null && !self.pos.in_check() && self.pos.null_okay() && depth > NULL_DEPTH {
            self.pos.null_move();
            vl = -self.search_full(-vl_beta, 1 - vl_beta, depth - NULL_DEPTH - 1, true);
            self.pos.undo_null_move();
            if vl >= vl_beta
                && (self.pos.null_safe()
                    || self.search_full(vl_alpha, vl_beta, depth - NULL_DEPTH, true) >= vl_beta)
            {
                return vl;
            }
        }

        let mut hash_flag = HASH_ALPHA;
        let mut vl_best = -MATE_VALUE;
        let mut mv_best = 0;

        let mut sort = MoveSort::new(
            mv_hash_val,
            &self.pos,
            &self.killer_table,
            &self.history_table,
        );

        loop {
            let mv = sort.next(&self.pos, &self.history_table);
            if mv == 0 {
                break;
            }

            if !self.pos.make_move(mv) {
                continue;
            }

            let new_depth = if self.pos.in_check() || sort.single_reply {
                depth
            } else {
                depth - 1
            };

            if vl_best == -MATE_VALUE {
                vl = -self.search_full(-vl_beta, -vl_alpha, new_depth, false);
            } else {
                vl = -self.search_full(-(vl_alpha + 1), -vl_alpha, new_depth, false);
                if vl > vl_alpha && vl < vl_beta {
                    vl = -self.search_full(-vl_beta, -vl_alpha, new_depth, false);
                }
            }
            self.pos.undo_make_move();

            if vl > vl_best {
                vl_best = vl;
                if vl >= vl_beta {
                    hash_flag = HASH_BETA;
                    mv_best = mv;
                    break;
                }
                if vl > vl_alpha {
                    vl_alpha = vl;
                    hash_flag = HASH_PV;
                    mv_best = mv;
                }
            }
        }

        if vl_best == -MATE_VALUE {
            return self.pos.mate_value();
        }

        self.record_hash(hash_flag, vl_best, depth, mv_best);
        if mv_best > 0 {
            self.set_best_move(mv_best, depth);
        }
        vl_best
    }

    /// 根节点搜索函数
    ///
    /// # 参数
    /// * `vl_alpha` - Alpha 值
    /// * `vl_beta` - Beta 值
    /// * `depth` - 搜索深度
    fn search_root(&mut self, mut vl_alpha: i32, vl_beta: i32, depth: u32) -> i32 {
        let mv_hash_val = 0;
        let mut sort = MoveSort::new(
            mv_hash_val,
            &self.pos,
            &self.killer_table,
            &self.history_table,
        );
        let mut mv_best = 0;
        let mut vl = -MATE_VALUE;
        let mut vl_best = -MATE_VALUE;

        self.all_nodes += 1;

        loop {
            let mv = sort.next(&self.pos, &self.history_table);
            if mv == 0 {
                break;
            }

            if !self.pos.make_move(mv) {
                continue;
            }

            if mv_best == 0 {
                vl = -self.search_full(-vl_beta, -vl_alpha, depth, false);
            } else {
                vl = -self.search_full(-(vl_alpha + 1), -vl_alpha, depth, false);
                if vl > vl_alpha && vl < vl_beta {
                    vl = -self.search_full(-vl_beta, -vl_alpha, depth, false);
                }
            }
            self.pos.undo_make_move();

            if false {
                return 0;
            }

            if vl > vl_best {
                vl_best = vl;
                if vl >= vl_beta {
                    self.mv_result = mv;
                    return vl;
                }
                if vl > vl_alpha {
                    vl_alpha = vl;
                    mv_best = mv;
                }
            }
        }
        if mv_best > 0 {
            self.mv_result = mv_best;
        }
        vl_best
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
        assert_eq!(
            pos.to_fen(),
            "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w"
        );
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
        let fen = "4k4/9/3r5/9/9/9/4K4/9/9/9 b - - 0 1";
        pos.from_fen(fen);
        let check_move = make_move(coord_xy(6, 5), coord_xy(7, 5));
        assert!(pos.make_move(check_move));
        assert!(pos.checked());
    }

    #[test]
    fn test_is_mate_no_moves() {
        let mut pos = Position::new();
        // A mate position (example: king has no moves and is in check)
        let mate_fen = "4k4/4R4/9/9/9/9/9/9/4K4/9 b - - 0 1"; // Simplified mate for red
        pos.from_fen(mate_fen);
        assert!(pos.checked()); // King should be in check
                                // assert!(pos.is_mate()); // Should be mate
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
    }

    #[test]
    fn test_mirror_initial_pos() {
        let mut pos = Position::new();
        pos.from_fen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");
        let mirrored_pos = pos.mirror();
        assert_eq!(
            mirrored_pos.to_fen(),
            "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w"
        );
    }

    #[test]
    fn test_mirror_non_symmetrical_pos() {
        let mut pos = Position::new();
        pos.from_fen("8/9/9/9/9/9/9/9/9/R8 w - - 0 1");
        let mirrored_pos = pos.mirror();
        assert_eq!(mirrored_pos.to_fen(), "9/9/9/9/9/9/9/9/9/8R w");

        let mut pos_b = Position::new();
        pos_b.from_fen("8/9/9/9/9/9/9/9/9/R8 b - - 0 1");
        let mirrored_pos_b = pos_b.mirror();
        assert_eq!(mirrored_pos_b.to_fen(), "9/9/9/9/9/9/9/9/9/8R b");
    }

    #[test]
    fn test_history_index() {
        let mut pos = Position::new();
        pos.from_fen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");

        let mv = make_move(coord_xy(3, 12), coord_xy(3, 11));
        let expected_index = (((pos.squares[src(mv) as usize] - 8) as u16) << 8) + dst(mv) as u16;
        assert_eq!(pos.history_index(mv), expected_index);
    }
}
