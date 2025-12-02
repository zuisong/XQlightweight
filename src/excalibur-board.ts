// src/excalibur-board.ts
import { Engine, DisplayMode, Color, Vector, Actor, Timer } from "excalibur";
import { Resources, loader } from "./resources";
import { PieceActor, SelectionActor, ThinkingActor } from "./actors";
import { XiangQiEngine } from "./engine/index";
import {
  IN_BOARD,
  SRC,
  DST,
  MOVE,
  SQUARE_FLIP,
  SIDE_TAG,
  PIECE_KING,
  PIECE_ROOK,
  PIECE_CANNON,
  PIECE_KNIGHT,
  PIECE_PAWN,
  PIECE_ADVISOR,
  PIECE_BISHOP,
  FILE_X,
  RANK_Y
} from "./engine/position";
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  SQUARE_SIZE,
  THINKING_LEFT,
  THINKING_TOP
} from "./constants";

export const RESULT_UNKNOWN = 0;
const RESULT_WIN = 1;
const RESULT_DRAW = 2;
const RESULT_LOSS = 3;

export class ExcaliburBoard {
  game: Engine;
  engine: XiangQiEngine;
  
  // Actors
  pieceActors: (PieceActor | null)[] = []; // One per square, indexed 0-255
  selectionActors: SelectionActor[] = []; // Pool of selection indicators
  thinkingActor: ThinkingActor;

  // Game State
  sqSelected = 0;
  mvLast = 0;
  millis = 0;
  computer = -1;
  result = RESULT_UNKNOWN;
  busy = false;
  animated = true;
  sound = true;

  onAddMove: (() => void) | undefined = undefined;

  constructor(containerId: string) {
    this.engine = new XiangQiEngine();
    
    this.game = new Engine({
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      canvasElementId: containerId,
      displayMode: DisplayMode.Fixed,
      backgroundColor: Color.fromHex('#f0d9b5'), // Fallback color
    });

    // Setup Board Background
    const boardActor = new Actor({
      pos: Vector.Zero,
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      anchor: Vector.Zero,
      z: 0
    });
    boardActor.graphics.use(Resources.Board.toSprite());
    this.game.add(boardActor);

    // Setup Piece Actors
    // We create 256 slots, but only populate IN_BOARD ones
    for (let i = 0; i < 256; i++) {
        if (IN_BOARD(i)) {
            const piece = new PieceActor(i, 0, false);
            // Bind click event
            piece.on('pointerdown', () => {
                this.clickSquare(i);
            });
            this.pieceActors[i] = piece;
            this.game.add(piece);
        } else {
            this.pieceActors[i] = null;
        }
    }

    // Setup Selection Actors (we need at most 3: source, dest, selected)
    for (let i = 0; i < 3; i++) {
        const sel = new SelectionActor();
        this.selectionActors.push(sel);
        this.game.add(sel);
    }

    // Setup Thinking Actor
    this.thinkingActor = new ThinkingActor();
    this.thinkingActor.pos = new Vector(THINKING_LEFT, THINKING_TOP);
    this.game.add(this.thinkingActor);

    // Start the game engine
    this.game.start(loader).then(() => {
       this.flushBoard();
    });
  }

  playSound(soundName: keyof typeof Resources) {
    if (!this.sound) return;
    const sound = Resources[soundName];
    if (sound && 'play' in sound) {
        (sound as any).play();
    }
  }

  flipped(sq: number) {
    return this.computer === 0 ? SQUARE_FLIP(sq) : sq;
  }

  computerMove() {
    return this.engine.sdPlayer === this.computer;
  }

  clickSquare(sq_: number) {
    if (this.busy || this.result !== RESULT_UNKNOWN) {
      return;
    }
    // If clicking on empty board part (not actor), pieceActors[sq] handle clicks.
    // But empty squares also need click handling if we want to move there.
    // The PieceActor covers the square area, even if invisible (opacity 0? No, I hid it).
    // Wait, PieceActor logic: "graphics.hide()" makes it invisible AND likely non-interactive by default in Excalibur unless collider is present.
    // We need to ensure even empty squares are clickable. 
    // FIX: In PieceActor, instead of hiding, maybe use an empty graphic or ensure collider exists.
    // Or simpler: Add an invisible "ClickableSquare" actor for every board square at Z index 1.
    
    const sq = this.flipped(sq_);
    const pc = this.engine.getPiece(sq);
    const selfSide = SIDE_TAG(this.engine.sdPlayer);

    if ((pc & selfSide) !== 0) {
      // Clicked own piece
      this.playSound("Click");
      this.sqSelected = sq;
      this.updateSelection();
    } else if (this.sqSelected > 0) {
      // Clicked target (enemy or empty)
      // Try to move
      this.addMove(MOVE(this.sqSelected, sq), false);
    }
  }

  async addMove(mv: number, computerMove: boolean) {
    if (!this.engine.legalMove(mv)) {
        // Deselect if illegal move on empty/enemy
        this.sqSelected = 0;
        this.updateSelection();
        return;
    }

    if (!this.engine.makeInternalMove(mv)) {
      this.playSound("Illegal");
      return;
    }

    this.busy = true;
    // Animation logic
    if (this.animated) {
        await this.animateMove(mv);
    }
    
    this.postAddMove(mv, computerMove);
  }

  animateMove(mv: number): Promise<void> {
      return new Promise((resolve) => {
          const sqSrc = this.flipped(SRC(mv));
          const sqDst = this.flipped(DST(mv));
          
          const pieceActor = this.pieceActors[SRC(mv)];
          if (!pieceActor) { resolve(); return; } // Should not happen

          // Temporarily bring piece to front
          const oldZ = pieceActor.z;
          pieceActor.z = 100;

          const targetX = BOARD_OFFSET_X + (FILE_X(sqDst) - 3) * SQUARE_SIZE;
          const targetY = BOARD_OFFSET_Y + (RANK_Y(sqDst) - 3) * SQUARE_SIZE;

          pieceActor.actions.moveTo(targetX, targetY, 500).callMethod(() => {
              pieceActor.z = oldZ;
              resolve();
          });
      });
  }

  postAddMove(mv: number, computerMove: boolean) {
    this.mvLast = mv;
    this.sqSelected = 0;
    this.flushBoard(); // Updates all positions instantly (after animation)
    
    // Check Game Status
    if (this.engine.isMate()) {
      this.playSound(computerMove ? "Loss" : "Win");
      this.result = computerMove ? RESULT_LOSS : RESULT_WIN;
      this.alertDelay(computerMove ? "请再接再厉！" : "祝贺你取得胜利！");
      this.postAddMove2();
      this.busy = false;
      return;
    }

    // Repetition Check
    let vlRep = this.engine.repStatus(3);
    if (vlRep > 0) {
        vlRep = this.engine.repValue(vlRep);
        const WIN_VALUE_THRESHOLD = 9000; 
        if (vlRep > -WIN_VALUE_THRESHOLD && vlRep < WIN_VALUE_THRESHOLD) {
            this.playSound("Draw");
            this.result = RESULT_DRAW;
            this.alertDelay("双方不变作和，辛苦了！");
        } else if (computerMove === (vlRep < 0)) {
            this.playSound("Loss");
            this.result = RESULT_LOSS;
            this.alertDelay("长打作负，请不要气馁！");
        } else {
            this.playSound("Win");
            this.result = RESULT_WIN;
            this.alertDelay("长打作负，祝贺你取得胜利！");
        }
        this.postAddMove2();
        this.busy = false;
        return;
    }

    // Check/Capture sounds
    if (this.engine.inCheck()) {
        this.playSound(computerMove ? "Check2" : "Check");
    } else if (this.engine.captured()) {
        this.playSound(computerMove ? "Capture2" : "Capture");
    } else {
        this.playSound(computerMove ? "Move2" : "Move");
    }

    this.postAddMove2();
    this.response();
  }

  postAddMove2() {
      if (this.onAddMove) this.onAddMove();
  }

  response() {
      if (!this.computerMove()) {
          this.busy = false;
          return;
      }
      
      this.thinkingActor.showThinking();
      this.busy = true;

      // Yield to UI thread slightly
      setTimeout(async () => {
          const ucciMove = this.engine.findBestMove(64, this.millis);
          this.thinkingActor.hideThinking();
          if (ucciMove === "nomove") {
              this.busy = false;
              return;
          }
          const internalMove = this.engine.ucciMoveToInternal(ucciMove);
          this.addMove(internalMove, true);
      }, 250);
  }

  flushBoard() {
      // Update all piece positions and types
      for (let i = 0; i < 256; i++) {
          if (IN_BOARD(i)) {
              const pc = this.engine.getPiece(i);
              const actor = this.pieceActors[i];
              if (actor) {
                  actor.setPiece(pc);
                  // We MUST update the 'sq' property if we are just redrawing, 
                  // but actually PieceActors are fixed to specific squares logically 0-255.
                  // Their graphics change. 
                  // The 'flipped' status determines their screen position.
                  // We need to update their screen position if board is flipped/unflipped.
                  // Actually, `actor.sq` is constant `i`. 
                  // We just call `updatePosition` which uses `this._flipped`.
                  // Wait, I stored `_flipped` on the actor in `actors.ts`.
                  // I need to update that if the board flip state changes.
                  // But `ExcaliburBoard` controls `flipped(sq)`.
                  // Let's just manually force position update here.
                  
                  const displaySq = this.flipped(i);
                  const file = (displaySq & 15);
                  const rank = (displaySq >> 4);
                  actor.pos.x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE;
                  actor.pos.y = BOARD_OFFSET_Y + (rank - 3) * SQUARE_SIZE;
                  
                  // If it's an empty square, we still want it to be clickable.
                  // In Excalibur, an Actor with no Graphic but a collider is clickable.
                  // Or we can use an invisible graphic.
                  if (pc === 0) {
                      // Ensure clickable area
                      actor.graphics.opacity = 0; // Make invisible
                      // We need a dummy graphic/rect to ensure size? 
                      // In `PieceActor` constructor we set width/height. 
                      // Excalibur needs a collider for events usually? 
                      // Actually `pointerdown` works on the actor's bounds/collider.
                      // Let's ensure it has a default collider box.
                      // PieceActor constructor sets width/height, Excalibur creates default BoxCollider.
                  } else {
                      actor.graphics.opacity = 1;
                  }
              }
          }
      }
      this.updateSelection();
  }

  updateSelection() {
      // Hide all selections first
      this.selectionActors.forEach(a => a.deselect());

      let idx = 0;
      const show = (sq: number) => {
          if (idx < this.selectionActors.length) {
              // We need to pass "flipped" boolean to selection actor or calculate pos here
              // Logic is simpler if we calculate pos here or update SelectionActor to use helper
              // SelectionActor `select` method takes (sq, flipped).
              // Wait, I need `flipped` bool.
              // `this.flipped(sq)` returns the display square index.
              // `SelectionActor.select` takes `sq` and `flipped`.
              // My `flipped` logic in `ExcaliburBoard` returns integer.
              // Let's just move the Actor manually here.
              
              const displaySq = this.flipped(sq);
              const file = (displaySq & 15);
              const rank = (displaySq >> 4);
              const sel = this.selectionActors[idx++];
              sel.pos.x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE;
              sel.pos.y = BOARD_OFFSET_Y + (rank - 3) * SQUARE_SIZE;
              sel.graphics.visible = true;
          }
      };

      if (this.mvLast > 0) {
          show(SRC(this.mvLast));
          show(DST(this.mvLast));
      }
      if (this.sqSelected > 0) {
          show(this.sqSelected);
      }
  }

  alertDelay(msg: string) {
      setTimeout(() => alert(msg), 250);
  }

  // API for UI
  restart(fen: string) {
      if (this.busy) return;
      this.result = RESULT_UNKNOWN;
      this.engine.loadFen(fen);
      this.mvLast = 0;
      this.sqSelected = 0;
      this.flushBoard();
      this.playSound("NewGame");
      this.response();
  }

  retract() {
      if (this.busy) return;
      this.result = RESULT_UNKNOWN;
      if (this.engine.getHistoryLength() > 1) {
          this.engine.undoInternalMove();
      }
      if (this.engine.getHistoryLength() > 1 && this.computerMove()) {
          this.engine.undoInternalMove();
      }
      this.mvLast = this.engine.lastMove();
      this.sqSelected = 0;
      this.flushBoard();
      this.response();
  }
  
  setSound(enabled: boolean) {
      this.sound = enabled;
  }
}
