// src/actors.ts
import { Actor, Vector } from "excalibur";
import { BOARD_OFFSET_X, BOARD_OFFSET_Y, PIECE_IMAGE_MAP, SQUARE_SIZE } from "./constants";
import { FILE_X, RANK_Y } from "./engine/position";
import { Resources } from "./resources";

export class PieceActor extends Actor {
  public sq: number;
  public pieceType: number;
  private _flipped: boolean = false;

  constructor(sq: number, pieceType: number, flipped: boolean) {
    super({
      width: SQUARE_SIZE,
      height: SQUARE_SIZE,
      anchor: Vector.Zero, // Top-left anchor for easier grid positioning
      z: 10 // Pieces are above board (z=0)
    });
    this.sq = sq;
    this.pieceType = pieceType;
    this._flipped = flipped;
    this.updatePosition();
    this.updateGraphics();
  }

  updatePosition() {
    const displaySq = this._flipped ? 254 - this.sq : this.sq;
    const file = FILE_X(displaySq);
    const rank = RANK_Y(displaySq);
    
    // Convert board coordinates to screen coordinates
    // Engine coordinates: file 3-11, rank 3-12
    // Screen coordinates offset: file-3, rank-3
    this.pos.x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE;
    this.pos.y = BOARD_OFFSET_Y + (rank - 3) * SQUARE_SIZE;
  }

  updateGraphics() {
    const pieceName = PIECE_IMAGE_MAP[this.pieceType];
    if (pieceName && (Resources as any)[pieceName]) {
      this.graphics.use((Resources as any)[pieceName].toSprite());
      this.graphics.visible = true;
    } else {
        this.graphics.visible = false;
    }
  }

  setPiece(type: number) {
      this.pieceType = type;
      this.updateGraphics();
  }
}

export class SelectionActor extends Actor {
    constructor() {
        super({
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            anchor: Vector.Zero,
            z: 5 // Below pieces (z=10), above board
        });
        this.graphics.use(Resources.OOS.toSprite());
        this.graphics.visible = false; // Hidden by default
    }

    select(sq: number, flipped: boolean) {
        const displaySq = flipped ? 254 - sq : sq;
        const file = FILE_X(displaySq);
        const rank = RANK_Y(displaySq);
        this.pos.x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE;
        this.pos.y = BOARD_OFFSET_Y + (rank - 3) * SQUARE_SIZE;
        this.graphics.visible = true;
    }

    deselect() {
        this.graphics.visible = false;
    }
}

export class ThinkingActor extends Actor {
    constructor() {
        super({
            pos: new Vector(244, 272), // Centerish approximation, will be set by constant
            z: 20
        });
        this.graphics.use(Resources.Thinking.toSprite());
        this.graphics.visible = false;
    }
    
    showThinking() {
        this.graphics.visible = true;
    }

    hideThinking() {
        this.graphics.visible = false;
    }
}
