// src/constants.ts

export const BOARD_WIDTH = 521;
export const BOARD_HEIGHT = 577;
export const SQUARE_SIZE = 57;

// These are pixel offsets for the top-left of the first square (a9)
export const BOARD_OFFSET_X = (BOARD_WIDTH - SQUARE_SIZE * 9) / 2;
export const BOARD_OFFSET_Y = (BOARD_HEIGHT - SQUARE_SIZE * 10) / 2;

// Piece names mapping to image files
export const PIECE_IMAGE_MAP: { [key: number]: string } = {
  // Red Pieces (sdPlayer = 0, pc is 8-14)
  8: "rk",   // Red King
  9: "ra",   // Red Advisor
  10: "rb",  // Red Bishop
  11: "rn",  // Red Knight
  12: "rr",  // Red Rook
  13: "rc",  // Red Cannon
  14: "rp",  // Red Pawn

  // Black Pieces (sdPlayer = 1, pc is 16-22)
  16: "bk",  // Black King
  17: "ba",  // Black Advisor
  18: "bb",  // Black Bishop
  19: "bn",  // Black Knight
  20: "br",  // Black Rook
  21: "bc",  // Black Cannon
  22: "bp",  // Black Pawn
};

export const THINKING_SIZE = 32;
export const THINKING_LEFT = (BOARD_WIDTH - THINKING_SIZE) / 2;
export const THINKING_TOP = (BOARD_HEIGHT - THINKING_SIZE) / 2;

// Engine's internal board representation
export const FILE_LEFT_ENGINE = 3;
export const RANK_TOP_ENGINE = 3;
