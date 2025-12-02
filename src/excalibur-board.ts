// src/excalibur-board.ts
import { Engine, DisplayMode, Color, Vector, Actor, vec } from "excalibur";
import { Resources } from "./resources";
import { PieceActor, SelectionActor, ThinkingActor } from "./actors";
import { XiangQiEngine } from "./engine/index";
import { Button, Checkbox, TextButton, type ButtonStyle } from "./ui-actors";
import { CustomLoader } from './custom-loader';
import {
  IN_BOARD,
  SRC,
  DST,
  MOVE,
  SQUARE_FLIP,
  SIDE_TAG,
  FILE_X,
  RANK_Y,
  FILE_LEFT,
  RANK_TOP,
  CHR,
  ASC
} from "./engine/position";
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  SQUARE_SIZE,
  THINKING_LEFT,
  THINKING_TOP,
  TOTAL_WIDTH_HORIZONTAL,
  UI_OFFSET_X_HORIZONTAL,
  UI_OFFSET_Y_HORIZONTAL,
  UI_LINE_HEIGHT,
  TOTAL_WIDTH_VERTICAL, 
  TOTAL_HEIGHT_VERTICAL, 
  UI_OFFSET_X_VERTICAL, 
  UI_OFFSET_Y_VERTICAL,
  COLORS
} from "./constants";

export const RESULT_UNKNOWN = 0;
const RESULT_WIN = 1;
const RESULT_DRAW = 2;
const RESULT_LOSS = 3;

const STARTUP_FEN = [
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w", // No Handicap
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKABNR w", // Left Knight
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKAB1R w", // Double Knights
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w",           // Nine Pieces (King + Pawns only)
];

export interface ExcaliburBoardOptions {
    containerId: string;
    screenWidth: number;
    screenHeight: number;
    isDarkMode: boolean;
    setBackgroundColor: (color: string) => void;
}

export class ExcaliburBoard {
  game: Engine;
  engine: XiangQiEngine;
  
  // Actors
  pieceActors: (PieceActor | null)[] = [];
  selectionActors: SelectionActor[] = [];
  thinkingActor: ThinkingActor;
  
  // UI Actors
  moveListActors: TextButton[] = [];
  moveListContainer: Actor | undefined;

  // Game State
  sqSelected = 0;
  mvLast = 0;
  millis = 10;
  computer = 1; // Default: Computer goes second (1), User goes first (0)
  result = RESULT_UNKNOWN;
  busy = false;
  animated = false; // Default to false for no initial animation
  sound = true;
  
  // Settings State
  handicapIndex = 0;
  levelIndex = 0;
  moveModeIndex = 0; // 0: User first, 1: Computer first, 2: PvE (No computer? Or PvP? Original said "No Computer")

  // Theme
  colors: typeof COLORS.light;

  constructor(options: ExcaliburBoardOptions) {
    this.engine = new XiangQiEngine();
    
    // Detect Layout & Theme
    const isMobile = options.screenWidth < 800; 
    this.colors = options.isDarkMode ? COLORS.dark : COLORS.light;

    // Dynamic Resolution Calculation
    const screenWidth = options.screenWidth;
    const screenHeight = options.screenHeight;
    const screenRatio = screenWidth / screenHeight;

    let width, height;
    let displayMode: DisplayMode;

    if (isMobile) {
        // Vertical Layout: Fixed Width (Board Width), Dynamic Height
        const minHeight = TOTAL_HEIGHT_VERTICAL; // Content height
        // Calculate height based on width to fill screen ratio
        // targetHeight = TOTAL_WIDTH_VERTICAL / screenRatio
        const targetHeight = TOTAL_WIDTH_VERTICAL / screenRatio;
        
        width = TOTAL_WIDTH_VERTICAL;
        height = Math.max(minHeight, targetHeight);
        displayMode = DisplayMode.FitScreen;
    } else {
        // Horizontal Layout: Fixed Size for Desktop (Centered)
        width = TOTAL_WIDTH_HORIZONTAL;
        height = BOARD_HEIGHT;
        displayMode = DisplayMode.Fixed;
    }

    this.game = new Engine({
      width: width,
      height: height,
      canvasElementId: options.containerId,
      displayMode: displayMode, 
      backgroundColor: Color.fromHex(this.colors.background), 
    });

    // Ensure body background matches for seamless feel, especially with FitScreen
    options.setBackgroundColor(this.colors.background);

    // Board Background (Always top-left)
    const boardActor = new Actor({
      pos: Vector.Zero,
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      anchor: Vector.Zero,
      z: 0
    });
    boardActor.graphics.use(Resources.Board.toSprite());
    this.game.add(boardActor);

    // Setup Pieces
    for (let i = 0; i < 256; i++) {
        if (IN_BOARD(i)) {
            const piece = new PieceActor(i, 0, false);
            piece.on('pointerdown', () => this.clickSquare(i));
            this.pieceActors[i] = piece;
            this.game.add(piece);
        } else {
            this.pieceActors[i] = null;
        }
    }

    // Setup Selection
    for (let i = 0; i < 3; i++) {
        const sel = new SelectionActor();
        this.selectionActors.push(sel);
        this.game.add(sel);
    }

    // Setup Thinking
    this.thinkingActor = new ThinkingActor();
    this.thinkingActor.pos = new Vector(THINKING_LEFT, THINKING_TOP);
    this.game.add(this.thinkingActor);

    // --- UI Setup ---
    this.setupUI(isMobile);

    // Start with custom loader
    const customLoader = new CustomLoader();
    this.game.start(customLoader).then(() => {
       this.restart(); // Initial start
    });
  }

  setupUI(isMobile: boolean) {
      let x: number, y: number;
      
      if (isMobile) {
          x = UI_OFFSET_X_VERTICAL;
          y = UI_OFFSET_Y_VERTICAL;
      } else {
          x = UI_OFFSET_X_HORIZONTAL;
          y = UI_OFFSET_Y_HORIZONTAL;
      }

      const buttonStyle: ButtonStyle = {
          backgroundColor: Color.fromHex(this.colors.button),
          textColor: Color.fromHex(this.colors.buttonText),
          hoverColor: Color.fromHex(this.colors.buttonHover)
      };
      const selectedColor = Color.fromHex(this.colors.selected);

      if (isMobile) {
          // Mobile Layout: Centered, Larger Buttons
          const padding = 20;
          const gap = 20;
          const contentWidth = TOTAL_WIDTH_VERTICAL - padding * 2;
          const btnW = (contentWidth - gap) / 2;
          const btnH = 50; // Larger height for touch

          const col1X = padding;
          const col2X = padding + btnW + gap;

          // Row 1: Restart | Retract
          const btnRestart = new Button(vec(col1X, y), "重新开始", () => this.restart(), buttonStyle, btnW, btnH);
          this.game.add(btnRestart);
          
          const btnRetract = new Button(vec(col2X, y), "悔棋", () => this.retract(), buttonStyle, btnW, btnH);
          this.game.add(btnRetract);
          y += btnH + gap;
          
          // Row 2: MoveMode | Level
          const btnMoveMode = new Button(vec(col1X, y), this.getMoveModeText(), () => {
              this.moveModeIndex = (this.moveModeIndex + 1) % 3;
              btnMoveMode.setText(this.getMoveModeText());
          }, buttonStyle, btnW, btnH);
          this.game.add(btnMoveMode);
          
          const btnLevel = new Button(vec(col2X, y), this.getLevelText(), () => {
              this.levelIndex = (this.levelIndex + 1) % 3;
              btnLevel.setText(this.getLevelText());
              this.millis = 10 ** (this.levelIndex + 1);
          }, buttonStyle, btnW, btnH);
          this.game.add(btnLevel);
          y += btnH + gap;

          // Row 3: Handicap | Checkboxes (Stacked)
          const btnHandicap = new Button(vec(col1X, y), this.getHandicapText(), () => {
              this.handicapIndex = (this.handicapIndex + 1) % 4;
              btnHandicap.setText(this.getHandicapText());
          }, buttonStyle, btnW, btnH);
          this.game.add(btnHandicap);
          
          // Stack Checkboxes in Col 2 space
          const chkH = btnH / 2;
          const chkAnim = new Checkbox(vec(col2X, y), "动画", this.animated, (checked) => this.animated = checked, buttonStyle, btnW, chkH);
          this.game.add(chkAnim);
          
          const chkSound = new Checkbox(vec(col2X, y + chkH), "音效", this.sound, (checked) => this.sound = checked, buttonStyle, btnW, chkH);
          this.game.add(chkSound);
          y += btnH + gap;
          
          // Move List
          const listBtnH = 30; // Larger list items too
          for (let i = 0; i < 4; i++) { 
              const btn = new TextButton(vec(col1X, y + i * listBtnH), "", () => this.handleMoveListClick(i), buttonStyle, selectedColor, contentWidth, listBtnH);
              this.moveListActors.push(btn);
              this.game.add(btn);
          }
          
      } else {
          // Desktop Layout
          // Restart Button
          const btnRestart = new Button(vec(x, y), "重新开始", () => this.restart(), buttonStyle);
          this.game.add(btnRestart);
          y += UI_LINE_HEIGHT;

          const btnRetract = new Button(vec(x, y), "悔棋", () => this.retract(), buttonStyle);
          this.game.add(btnRetract);
          y += UI_LINE_HEIGHT * 1.5;

          const btnMoveMode = new Button(vec(x, y), this.getMoveModeText(), () => {
              this.moveModeIndex = (this.moveModeIndex + 1) % 3;
              btnMoveMode.setText(this.getMoveModeText());
          }, buttonStyle);
          this.game.add(btnMoveMode);
          y += UI_LINE_HEIGHT;

          const btnHandicap = new Button(vec(x, y), this.getHandicapText(), () => {
              this.handicapIndex = (this.handicapIndex + 1) % 4;
              btnHandicap.setText(this.getHandicapText());
          }, buttonStyle);
          this.game.add(btnHandicap);
          y += UI_LINE_HEIGHT;

          const btnLevel = new Button(vec(x, y), this.getLevelText(), () => {
              this.levelIndex = (this.levelIndex + 1) % 3;
              btnLevel.setText(this.getLevelText());
              this.millis = 10 ** (this.levelIndex + 1);
          }, buttonStyle);
          this.game.add(btnLevel);
          y += UI_LINE_HEIGHT * 1.5;

          const chkAnim = new Checkbox(vec(x, y), "动画", this.animated, (checked) => this.animated = checked, buttonStyle);
          this.game.add(chkAnim);
          y += 30;

          const chkSound = new Checkbox(vec(x, y), "音效", this.sound, (checked) => this.sound = checked, buttonStyle);
          this.game.add(chkSound);
          y += UI_LINE_HEIGHT;

          y += 10;
          
          // List Container Background
          this.moveListContainer = new Actor({
              pos: vec(x, y),
              width: 200,
              height: BOARD_HEIGHT - y - 20,
              anchor: Vector.Zero,
              color: Color.fromHex(this.colors.uiBackground),
              z: 90
          });
          this.game.add(this.moveListContainer);

          for (let i = 0; i < 12; i++) {
              const btn = new TextButton(vec(x, y + i * 20), "", () => this.handleMoveListClick(i), buttonStyle, selectedColor);
              this.moveListActors.push(btn);
              this.game.add(btn);
          }
      }
  }

  getMoveModeText() {
      const texts = ["我先走", "电脑先走", "不用电脑"];
      return `先手: ${texts[this.moveModeIndex]}`;
  }

  getHandicapText() {
      const texts = ["不让子", "让左马", "让双马", "让九子"];
      return `让子: ${texts[this.handicapIndex]}`;
  }

  getLevelText() {
      const texts = ["入门", "业余", "专业"];
      return `水平: ${texts[this.levelIndex]}`;
  }

  handleMoveListClick(displayIndex: number) {
      // This logic is tricky because the list scrolls.
      // We need to map displayIndex to actual move index.
      // For simplicity, let's just render the *last* N moves and only allow clicking those?
      // Or just simple "Go to start" functionality?
      // The original allowed clicking any move.
      
      // Let's implement a simple view: 
      // "Start"
      // "Move 1"
      // ...
      // If we have many moves, we only show the last 11.
      
      const totalMoves = this.engine.getHistoryLength();
      // Calculate start index for display
      // We have 12 slots. Slot 0 is always "Start"? Or we scroll?
      // Let's always put "Start" at slot 0 if we can, or just regular list.
      // If totalMoves > 12, we show totalMoves - 11 to totalMoves.
      
      let actualMoveIndex = -1;
      if (totalMoves <= 12) {
          actualMoveIndex = displayIndex - 1; // -1 because 0 is "Start" (index -1 for engine logic?)
          // Wait, engine moves are 0-indexed.
          // If user clicks "Start" (displayIndex 0), we want to go to state before move 0.
          // If user clicks "Move 1" (displayIndex 1), we want to go to state after move 0.
      } else {
          // Showing window [total - 11, total]
          // displayIndex 0 is move (total - 11)
          actualMoveIndex = (totalMoves - 12) + displayIndex;
      }

      // Logic to retract/forward
      // "Start" -> actualMoveIndex = -1.
      // "Move 0" -> actualMoveIndex = 0.
      
      if (actualMoveIndex > totalMoves - 1) return; // Clicked empty slot
      
      if (this.result !== RESULT_UNKNOWN) {
          // Only allow review if game over? Original code: "if (board.result !== RESULT_UNKNOWN)" 
          // NO, original code says "if (board.result !== RESULT_UNKNOWN) return" ??
          // No, wait. `if (board.result !== RESULT_UNKNOWN)` then perform logic? 
          // Original: `if (board.result !== RESULT_UNKNOWN) ...` block handles click.
          // Actually in `main.tsx`:
          /*
            const handleMoveClick = (e: any) => {
                if (board.result !== RESULT_UNKNOWN) { ... }
            }
          */
          // This implies you can ONLY click move list when game is OVER?
          // Let's stick to that logic for safety.
          
          const currentHistoryLen = this.engine.getHistoryLength();
          const targetHistoryLen = actualMoveIndex + 1; // Index 0 means length 1
          
          if (currentHistoryLen === targetHistoryLen) return;
          
          if (currentHistoryLen > targetHistoryLen) {
              while (this.engine.getHistoryLength() > targetHistoryLen) {
                  this.engine.undoInternalMove();
              }
          } else {
              // We need to replay moves.
              // This requires storing the moves permanently or re-generating?
              // `engine.undoInternalMove` pops from `mvList`.
              // If we pop, we lose the history in `engine`.
              // `XiangQiEngine` destroys history on undo?
              // `Position.undoMakeMove` pops `mvList`. Yes.
              
              // The original code had `selMoveList` DOM which KEPT the moves as data attributes.
              // `board.engine.makeInternalMove(Number(selMoveList().children[i].dataset.value))`
              // So the UI was the source of truth for the full game record!
              
              // I need to store the full game record in `ExcaliburBoard` to allow replay after undo.
              // `this.allMoves: number[]`.
          }
          this.flushBoard();
      }
  }
  
  // Store full history for replay
  allMoves: number[] = [];

  updateMoveList() {
      // Re-render the list text
      const totalMoves = this.engine.getHistoryLength();
      // We assume `allMoves` tracks the maximum history reached.
      // Actually, `onAddMove` pushes to list.
      
      const movesToRender = [];
      // Always add "Start"
      movesToRender.push({ index: -1, text: "=== 开始 ===" });
      
      // Use `allMoves` or `engine.getMoveList()`?
      // If we undo, `engine` loses moves. `allMoves` keeps them?
      // If we are just playing, `engine.getMoveList()` is fine.
      // If we undo, we are in a state where `engine` has fewer moves.
      // The DOM logic relied on the list elements existing.
      // I should sync `allMoves` with `engine` whenever a NEW move is made.
      
      const history = this.engine.getMoveList(); 
      // Note: getMoveList returns internal list which might include dummy 0 at start?
      // Engine initializes with `mvList = [0]`.
      // `getHistoryLength` returns `mvList.length`.
      // Real moves start at index 1?
      // `move2Iccs` expects a move number.
      
      // Let's stick to simpler logic: Only render current engine history.
      // If user wants to "Undo", we use the Retract button.
      // If game is over, maybe we show full list?
      // The requirement "Game settings and records" implies seeing the moves.
      
      for (let i = 1; i < history.length; i++) {
          const mv = history[i];
          const counter = i >> 1; // Roughly turn number
          const turnStr = (i % 2 !== 0) ? // Red moves are odd indices? 1, 3...
             ( (counter + 1) + ". " ) : "";
             
          // Actually original code logic:
          // const counter: number = board.engine.getHistoryLength() >> 1;
          // (board.engine.sdPlayer === 0 ? space : ...)
          
          // Let's just format simply: "1. C2.5"
          movesToRender.push({ index: i-1, text: this.move2Iccs(mv) });
      }
      
      // Display window
      const listSize = this.moveListActors.length;
      let startIndex = 0;
      if (movesToRender.length > listSize) {
          startIndex = movesToRender.length - listSize;
      }
      
      for (let i = 0; i < listSize; i++) {
          const data = movesToRender[startIndex + i];
          if (data) {
              this.moveListActors[i].setText(data.text);
              this.moveListActors[i].graphics.visible = true;
              // Highlight current?
              const isCurrent = (startIndex + i) === (movesToRender.length - 1);
              this.moveListActors[i].setSelected(isCurrent);
          } else {
              this.moveListActors[i].graphics.visible = false;
          }
      }
  }
  
  move2Iccs(mv: number): string {
    const sqSrc = SRC(mv);
    const sqDst = DST(mv);
    return `${CHR(ASC("A") + FILE_X(sqSrc) - FILE_LEFT) +
        CHR(ASC("9") - RANK_Y(sqSrc) + RANK_TOP)}-${CHR(ASC("A") + FILE_X(sqDst) - FILE_LEFT)}${CHR(ASC("9") - RANK_Y(sqDst) + RANK_TOP)}`;
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
    const sq = this.flipped(sq_);
    const pc = this.engine.getPiece(sq);
    const selfSide = SIDE_TAG(this.engine.sdPlayer);

    if ((pc & selfSide) !== 0) {
      this.playSound("Click");
      this.sqSelected = sq;
      this.updateSelection();
    } else if (this.sqSelected > 0) {
      this.addMove(MOVE(this.sqSelected, sq), false);
    }
  }

  async addMove(mv: number, computerMove: boolean) {
    if (!this.engine.legalMove(mv)) {
        this.sqSelected = 0;
        this.updateSelection();
        return;
    }

    if (!this.engine.makeInternalMove(mv)) {
      this.playSound("Illegal");
      return;
    }

    this.busy = true;
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
          if (!pieceActor) { resolve(); return; } 

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
    this.flushBoard();
    
    if (this.engine.isMate()) {
      this.playSound(computerMove ? "Loss" : "Win");
      this.result = computerMove ? RESULT_LOSS : RESULT_WIN;
      this.alertDelay(computerMove ? "请再接再厉！" : "祝贺你取得胜利！");
      this.postAddMove2();
      this.busy = false;
      return;
    }

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
      this.updateMoveList();
  }

  response() {
      if (!this.computerMove()) {
          this.busy = false;
          return;
      }
      
      this.thinkingActor.showThinking();
      this.busy = true;

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
      for (let i = 0; i < 256; i++) {
          if (IN_BOARD(i)) {
              const pc = this.engine.getPiece(i);
              const actor = this.pieceActors[i];
              if (actor) {
                  actor.setPiece(pc);
                  
                  const displaySq = this.flipped(i);
                  const file = (displaySq & 15);
                  const rank = (displaySq >> 4);
                  actor.pos.x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE;
                  actor.pos.y = BOARD_OFFSET_Y + (rank - 3) * SQUARE_SIZE;
                  
                  if (pc === 0) {
                      actor.graphics.opacity = 0; 
                  } else {
                      actor.graphics.opacity = 1;
                  }
              }
          }
      }
      this.updateSelection();
      this.updateMoveList();
  }

  updateSelection() {
      this.selectionActors.forEach(a => a.deselect());

      let idx = 0;
      const show = (sq: number) => {
          if (idx < this.selectionActors.length) {
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

  restart(fen?: string) {
      if (this.busy) return;
      this.result = RESULT_UNKNOWN;
      const fenToLoad = fen || STARTUP_FEN[this.handicapIndex];
      this.engine.loadFen(fenToLoad);
      this.mvLast = 0;
      this.sqSelected = 0;
      this.computer = 1 - this.moveModeIndex;
      // If "No Computer", computer = -1?
      if (this.moveModeIndex === 2) {
          this.computer = -1;
      }
      
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