// src/excalibur-board.ts
import { Actor, BaseAlign, Color, DisplayMode, Engine, Font, Label, Rectangle, TextAlign, Vector, vec } from "excalibur";
import { PieceActor, SelectionActor, ThinkingActor } from "./actors";
import {
  BOARD_HEIGHT,
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  BOARD_WIDTH,
  COLORS, 
  SQUARE_SIZE,
  THINKING_LEFT,
  THINKING_TOP,
  TOTAL_HEIGHT_VERTICAL, 
  TOTAL_WIDTH_HORIZONTAL,
  TOTAL_WIDTH_VERTICAL, 
  UI_LINE_HEIGHT,
  UI_OFFSET_X_HORIZONTAL,
  UI_OFFSET_X_VERTICAL, 
  UI_OFFSET_Y_HORIZONTAL,
  UI_OFFSET_Y_VERTICAL
} from "./constants";
import { CustomLoader } from './custom-loader';
import { XiangQiEngine } from "./engine/index";
import {
  ASC, 
  CHR,
  DST,
  FILE_LEFT,
  FILE_X,
  IN_BOARD,
  MOVE,
  RANK_TOP,
  RANK_Y,
  SIDE_TAG,
  SQUARE_FLIP,
  SRC
} from "./engine/position";
import { Resources } from "./resources";
import { Button, type ButtonStyle, Checkbox, Modal, TextButton } from "./ui-actors";

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
    onSaveGame: (fen: string) => void;
    onLoadGame: () => string | null;
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
  animated = true; // Default to true for initial animation
  sound = true;
  showScore = true;
  // scoreLabel: Label | undefined; // Replaced by bars
  scoreBarRed: Actor | undefined;
  scoreBarBlack: Actor | undefined;
  scoreBarBg: Actor | undefined;
  scoreBarLabel: Label | undefined;
  
  // Settings State
  handicapIndex = 0;
  levelIndex = 0;
  moveModeIndex = 0; // 0: User first, 1: Computer first, 2: PvE (No computer? Or PvP? Original said "No Computer")

  // Theme
  colors: typeof COLORS.light;
  private _onSaveGame: (fen: string) => void;
  private _onLoadGame: () => string | null;

  constructor(options: ExcaliburBoardOptions) {
    this._onSaveGame = options.onSaveGame;
    this._onLoadGame = options.onLoadGame;
    this.engine = new XiangQiEngine();
    
    // Detect Layout & Theme
    const isMobile = options.screenWidth < 800; 
    this.colors = options.isDarkMode ? COLORS.dark : COLORS.light;

    // Dynamic Resolution Calculation
    const screenWidth = options.screenWidth;
    const screenHeight = options.screenHeight; // Reverted to original screenHeight
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
       const savedFen = this._onLoadGame(); // Attempt to load game after initial restart
       if (savedFen) {
          this.engine.loadFen(savedFen);
          this.flushBoard();
       }
    });
  }

  setupUI(isMobile: boolean) {
      let x: number, y: number;
      
      // Calculate base positions
      if (isMobile) {
          x = UI_OFFSET_X_VERTICAL;
          // Adjust initial y for safe area top
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

      // --- Modal for Settings ---
      const modalWidth = isMobile ? TOTAL_WIDTH_VERTICAL * 0.9 : 400;
      const modalHeight = 450;
      const settingsModal = new Modal(modalWidth, modalHeight, Color.fromHex(this.colors.uiBackground));
      this.game.add(settingsModal);
      settingsModal.hide(); // Explicitly hide after adding to game

      // Populate Modal Content
      // We need to add actors to the modal's contentArea or just manage them manually when modal shows
      // Since Modal is a ScreenElement, its children move with it.
      
      const my = 20; // Modal Y relative to contentArea top-left (which is centered)
      // Actually Modal contentArea anchor is (0.5, 0.5). So (0,0) is center.
      // Let's make coordinates relative to top-left of modal content area.
      // TopLeft is (-width/2, -height/2).
      const startX = -modalWidth / 2 + 20;
      const startY = -modalHeight / 2 + 20;
      const itemGap = 50;
      const itemWidth = modalWidth - 40;

      // Settings Title
      const titleLabel = new Label({
          text: "游戏设置",
          pos: vec(0, startY),
          font: new Font({
              size: 24,
              color: Color.fromHex(this.colors.text),
              textAlign: TextAlign.Center,
              baseAlign: BaseAlign.Top
          })
      });
      settingsModal.contentArea.addChild(titleLabel);
      
      let currentY = startY + 50;

      // 1. Move Mode
      const btnMoveMode = new Button(vec(startX, currentY), this.getMoveModeText(), () => {
          this.moveModeIndex = (this.moveModeIndex + 1) % 3;
          btnMoveMode.setText(this.getMoveModeText());
      }, buttonStyle, itemWidth, 40);
      settingsModal.contentArea.addChild(btnMoveMode);
      currentY += itemGap;

      // 2. Handicap
      const btnHandicap = new Button(vec(startX, currentY), this.getHandicapText(), () => {
          this.handicapIndex = (this.handicapIndex + 1) % 4;
          btnHandicap.setText(this.getHandicapText());
      }, buttonStyle, itemWidth, 40);
      settingsModal.contentArea.addChild(btnHandicap);
      currentY += itemGap;

      // 3. Level
      const btnLevel = new Button(vec(startX, currentY), this.getLevelText(), () => {
          this.levelIndex = (this.levelIndex + 1) % 3;
          btnLevel.setText(this.getLevelText());
          this.millis = 10 ** (this.levelIndex + 1);
      }, buttonStyle, itemWidth, 40);
      settingsModal.contentArea.addChild(btnLevel);
      currentY += itemGap;

      // 4. Animation
      const chkAnim = new Checkbox(vec(startX, currentY), "动画效果", this.animated, (checked) => {
          this.animated = checked;
      }, buttonStyle, itemWidth, 40);
      settingsModal.contentArea.addChild(chkAnim);
      currentY += itemGap;

      // 5. Sound
      const chkSound = new Checkbox(vec(startX, currentY), "游戏音效", this.sound, (checked) => {
          this.sound = checked;
      }, buttonStyle, itemWidth, 40);
      settingsModal.contentArea.addChild(chkSound);
      currentY += itemGap;

      // 6. Show Score
      const chkScore = new Checkbox(vec(startX, currentY), "显示评分", this.showScore, (checked) => {
          this.showScore = checked;
          this.updateScore();
      }, buttonStyle, itemWidth, 40);
      settingsModal.contentArea.addChild(chkScore);
      currentY += itemGap;

      // 7. Restart (Inside Settings)
      const btnRestartInModal = new Button(vec(startX, currentY), "重新开始", () => {
          this.restart();
          settingsModal.hide();
      }, { ...buttonStyle, backgroundColor: Color.fromHex('#EF4444'), textColor: Color.White, hoverColor: Color.fromHex('#DC2626') }, itemWidth, 40);
      settingsModal.contentArea.addChild(btnRestartInModal);
      
      let sbX = 0;
      let sbY = 0;
      let sbW = 0;

      // --- Main Screen UI ---

      if (isMobile) {
          // Mobile Layout:
          // Row 1: Settings | Retract | Recommend
          const btnW = (TOTAL_WIDTH_VERTICAL - 80) / 3; // Adjusted for 3 buttons and more padding
          const btnH = 50;
          let currentButtonX = 20;

          const btnSettings = new Button(vec(currentButtonX, y), "设置", () => settingsModal.show(), buttonStyle, btnW, btnH);
          this.game.add(btnSettings);
          currentButtonX += btnW + 20;
          
          const btnRetract = new Button(vec(currentButtonX, y), "悔棋", () => this.retract(), buttonStyle, btnW, btnH);
          this.game.add(btnRetract);
          currentButtonX += btnW + 20;

          const btnRecommendMove = new Button(vec(currentButtonX, y), "提示", () => this.recommendMove(), buttonStyle, btnW, btnH);
          this.game.add(btnRecommendMove);
          
          y += btnH + 20;

          // Move List
          // Use remaining height, accounting for safe area bottom
          const listHeight = TOTAL_HEIGHT_VERTICAL - y - 20;
          // Background for list on mobile
          const listBg = new Actor({
              pos: vec(20, y),
              width: TOTAL_WIDTH_VERTICAL - 40,
              height: listHeight,
              anchor: Vector.Zero,
              color: Color.fromHex(this.colors.uiBackground),
              z: 90
          });
          this.game.add(listBg);

          const listBtnH = 30;
          const count = Math.floor(listHeight / listBtnH);
          for (let i = 0; i < count; i++) { 
              const btn = new TextButton(vec(20, y + i * listBtnH), "", () => this.handleMoveListClick(i), buttonStyle, selectedColor, TOTAL_WIDTH_VERTICAL - 40, listBtnH);
              this.moveListActors.push(btn);
              this.game.add(btn);
          }

          // Score Bar Position for Mobile
          sbX = TOTAL_WIDTH_VERTICAL / 2;
          sbY = BOARD_HEIGHT + 5;
          sbW = TOTAL_WIDTH_VERTICAL * 0.8;

      } else {
          // Desktop Layout
          // Restart Button
          // Or vertical stack
          const btnSettings = new Button(vec(x, y), "设置", () => settingsModal.show(), buttonStyle);
          this.game.add(btnSettings);
          y += UI_LINE_HEIGHT * 1.5;

          const btnRetract = new Button(vec(x, y), "悔棋", () => this.retract(), buttonStyle);
          this.game.add(btnRetract);
          y += UI_LINE_HEIGHT * 1.5;

          const btnRecommendMove = new Button(vec(x, y), "提示", () => this.recommendMove(), buttonStyle);
          this.game.add(btnRecommendMove);
          y += UI_LINE_HEIGHT * 1.5;

          // Score Bar Position for Desktop
          // x is the left edge of the column (541). UI content width is ~200.
          sbX = x + 100; 
          sbY = y + 5;
          sbW = 180;
          
          y += 25; // Space for bars

          // Move List
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

      // Score Bars (Shared Creation)
      const barWidth = sbW;
      const barHeight = 10;
      const barY = sbY;
      const barX = sbX;

      // Background Bar
      this.scoreBarBg = new Actor({
          pos: vec(barX, barY),
          anchor: vec(0.5, 0.5),
          width: barWidth,
          height: barHeight,
          z: 99
      });
      this.scoreBarBg.graphics.use(new Rectangle({ width: barWidth, height: barHeight, color: Color.Gray }));
      this.game.add(this.scoreBarBg);

      // Red Bar (Left side, Red color)
      this.scoreBarRed = new Actor({
          pos: vec(barX - barWidth/2, barY),
          anchor: vec(0, 0.5), // Left anchor
          z: 100
      });
      // Initial graphic will be updated by updateScore
      this.game.add(this.scoreBarRed);

      // Black Bar (Right side, Black color)
      this.scoreBarBlack = new Actor({
          pos: vec(barX + barWidth/2, barY),
          anchor: vec(1, 0.5), // Right anchor
          z: 100
      });
      // Initial graphic will be updated by updateScore
      this.game.add(this.scoreBarBlack);

      // Score Label (Percentage)
      this.scoreBarLabel = new Label({
          text: "50%",
          pos: vec(barX, barY),
          font: new Font({
              size: 10,
              color: Color.White,
              textAlign: TextAlign.Center,
              baseAlign: BaseAlign.Middle,
              bold: true
          }),
          z: 101 // Above bars
      });
      this.game.add(this.scoreBarLabel);
      
      this.updateScore(); // Initial update
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
    const sq = sq_;
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
    this._onSaveGame(this.engine.getFen()); // Auto-save after every move
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

  updateScore() {
      if (!this.scoreBarRed || !this.scoreBarBlack || !this.scoreBarBg) return;
      
      if (this.showScore) {
          const scores = this.engine.getScores();
          const total = scores.red + scores.black;
          
          // Avoid division by zero
          const redRatio = total === 0 ? 0.5 : scores.red / total;
          const blackRatio = total === 0 ? 0.5 : scores.black / total;
          
          // Update widths
          // BarBG width is fixed (80% of board/screen).
          // We need to set Red width to ratio * bgWidth.
          // And Black width to ratio * bgWidth.
          // Wait, Excalibur Actor width is for collider/drawing.
          // If we use a Rectangle graphic, we might need to recreate it or scale it.
          // Let's try scaling the Actor horizontally? 
          // Or changing the width property if using a Rectangle graphic.
          // Actually, `this.scoreBarRed` uses default graphic if not set?
          // In setupUI, I initialized them with `width` property but no explicit graphic.
          // Excalibur creates a default collider box, but NO graphic by default unless `color` is set?
          // If `color` is set in constructor, Excalibur <= 0.25 creates a Rect. 
          // In 0.28+, we need to explicitly use Graphics.
          // Let's check constructor again. `new Actor({ color: ... })` does NOT create a graphic automatically in newer versions?
          // Wait, Excalibur documentation says `color` property on Actor config sets the default graphic color IF it's a simple actor?
          // No, usually we need `graphics.use(...)`.
          // Let's fix initialization first to use Rectangles.
      
          const fullWidth = this.scoreBarBg.width;
          
          // Recreate graphics for dynamic width
          const redWidth = fullWidth * redRatio;
          const blackWidth = fullWidth * blackRatio;
          
          this.scoreBarRed.graphics.use(new Rectangle({
              width: redWidth,
              height: 10,
              color: Color.fromHex('#ef4444')
          }));
          // Since anchor is (0, 0.5), changing width of graphic is enough if pos is correct.
          
          this.scoreBarBlack.graphics.use(new Rectangle({
              width: blackWidth,
              height: 10,
              color: Color.Black
          }));

          this.scoreBarBg.graphics.visible = true;
          this.scoreBarRed.graphics.visible = true;
          this.scoreBarBlack.graphics.visible = true;

          if (this.scoreBarLabel) {
              this.scoreBarLabel.text = `红方胜率: ${(redRatio * 100).toFixed(0)}%`;
              this.scoreBarLabel.graphics.visible = true;
          }
      } else {
          this.scoreBarBg.graphics.visible = false;
          this.scoreBarRed.graphics.visible = false;
          this.scoreBarBlack.graphics.visible = false;
          if (this.scoreBarLabel) {
              this.scoreBarLabel.graphics.visible = false;
          }
      }
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
      this.updateScore();
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
      this._onSaveGame(this.engine.getFen()); // Save current game state before restarting
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

  async recommendMove() {
      if (this.busy || this.result !== RESULT_UNKNOWN) {
          return;
      }
      this.thinkingActor.showThinking();
      this.busy = true;

      // Give a small delay to show thinking indicator
      setTimeout(async () => {
          const ucciMove = this.engine.findBestMove(64, this.millis); // Use current level's millis
          this.thinkingActor.hideThinking();
          if (ucciMove === "nomove") {
              this.busy = false;
              return;
          }
          const internalMove = this.engine.ucciMoveToInternal(ucciMove);
          await this.addMove(internalMove, false); // Treat as user move for auto-save, not computerMove
          this.busy = false; // Release busy state after move is made
      }, 250);
  }
}