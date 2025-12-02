// src/resources.ts
import { ImageSource, Loader, Sound, Gif } from 'excalibur';
import { PIECE_IMAGE_MAP } from './constants';

// Board Image
const boardImg = new ImageSource('images/board.jpg');
const oosImg = new ImageSource('images/oos.gif'); // Selection overlay

// Piece Images
const pieceImages: { [key: string]: ImageSource } = {};
for (const key in PIECE_IMAGE_MAP) {
  const pieceName = PIECE_IMAGE_MAP[key];
  pieceImages[pieceName] = new Gif(`images/${pieceName}.gif`);
}
const thinkingImg = new Gif('images/thinking.gif');


// Sounds
const captureSound = new Sound('sounds/capture.wav');
const capture2Sound = new Sound('sounds/capture2.wav');
const checkSound = new Sound('sounds/check.wav');
const check2Sound = new Sound('sounds/check2.wav');
const clickSound = new Sound('sounds/click.wav');
const drawSound = new Sound('sounds/draw.wav');
const illegalSound = new Sound('sounds/illegal.wav');
const lossSound = new Sound('sounds/loss.wav');
const moveSound = new Sound('sounds/move.wav');
const move2Sound = new Sound('sounds/move2.wav');
const newgameSound = new Sound('sounds/newgame.wav');
const winSound = new Sound('sounds/win.wav');


export const Resources = {
  Board: boardImg,
  OOS: oosImg,
  Thinking: thinkingImg,
  ...pieceImages,
  Capture: captureSound,
  Capture2: capture2Sound,
  Check: checkSound,
  Check2: check2Sound,
  Click: clickSound,
  Draw: drawSound,
  Illegal: illegalSound,
  Loss: lossSound,
  Move: moveSound,
  Move2: move2Sound,
  NewGame: newgameSound,
  Win: winSound,
};

export const loader = new Loader(Object.values(Resources));
