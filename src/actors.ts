// src/actors.ts
import { Actor, Vector, Rectangle, Color } from "excalibur";
import { BOARD_OFFSET_X, BOARD_OFFSET_Y, PIECE_IMAGE_MAP, SQUARE_SIZE } from "./constants";
import { FILE_X, RANK_Y } from "./engine/position";
import { Resources } from "./resources";
import { PieceType } from "./engine";



export class PieceActor extends Actor {
  public sq: number;
  public pieceType: PieceType;
  private _flipped: boolean = false;

  constructor(sq: number, pieceType: PieceType, flipped: boolean) {
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
      this.graphics.isVisible = true;
    } else {
        this.graphics.isVisible = false;
    }
  }

  setPiece(type: PieceType) {
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
        this.graphics.isVisible = false; // Hidden by default
    }

    select(sq: number, flipped: boolean) {
        const displaySq = flipped ? 254 - sq : sq;
        const file = FILE_X(displaySq);
        const rank = RANK_Y(displaySq);
        this.pos.x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE;
        this.pos.y = BOARD_OFFSET_Y + (rank - 3) * SQUARE_SIZE;
        this.graphics.isVisible = true;
    }

    deselect() {
        this.graphics.isVisible = false;
    }
}

export class ThinkingActor extends Actor {
    constructor() {
        super({
            pos: new Vector(244, 272), // Centerish approximation, will be set by constant
            z: 20
        });
        this.graphics.isVisible = false; // Hidden by default initially
    }
    
    initializeGraphics() {
        const thinkingAnimation = Resources.Thinking.toAnimation();
        if(thinkingAnimation){
          this.graphics.use(thinkingAnimation);
          this.graphics.anchor = Vector.Half; // Center the graphic around its position
        }
    }
    
    showThinking() {
        this.graphics.isVisible = true;
    }

    hideThinking() {
        this.graphics.isVisible = false;
    }
}
