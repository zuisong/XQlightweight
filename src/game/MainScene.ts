import Phaser from 'phaser';
import { BOARD_HEIGHT, BOARD_OFFSET_X, BOARD_OFFSET_Y, BOARD_WIDTH, SQUARE_SIZE } from '../constants';
import { XiangQiEngine } from '../engine/index';
import { DST, IN_BOARD, MOVE, SIDE_TAG, SRC } from '../engine/position';
import { Assets } from './Assets';
import { Piece } from './Piece';

export default class MainScene extends Phaser.Scene {
    private engine: XiangQiEngine;
    private pieces: Map<number, Piece> = new Map();
    private selectedSq: number = 0;
    private selectionMarker!: Phaser.GameObjects.Image;
    private isFlipped: boolean = false;
    private thinkingMarker!: Phaser.GameObjects.DOMElement;
    private validMoveMarkers: Phaser.GameObjects.Image[] = [];
    private busy: boolean = false;

    constructor() {
        super('MainScene');
        this.engine = new XiangQiEngine();
    }

    preload() {
        Assets.preload(this);
    }

    create() {
        // Add Board
        this.add.image(0, 0, 'board').setOrigin(0, 0);

        // Selection Marker (OOS)
        this.selectionMarker = this.add.image(0, 0, 'oos').setOrigin(0, 0).setVisible(false).setDepth(5);

        // Generate Dot Texture
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0x0000ff, 0.5);
        graphics.fillCircle(16, 16, 8); // 32x32 texture, circle radius 8 centered at 16,16
        graphics.generateTexture('dot', 32, 32);

        // Valid Move Markers (Pool)
        for (let i = 0; i < 32; i++) {
            const marker = this.add.image(0, 0, 'dot').setOrigin(0.5).setVisible(false).setDepth(4);
            this.validMoveMarkers.push(marker);
        }

        // Initialize Pieces
        this.createPieces();

        // Thinking marker as DOMElement (GIF)
        const img = document.createElement('img');
        img.src = 'images/thinking.gif';
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.pointerEvents = 'none';

        this.thinkingMarker = this.add.dom(BOARD_WIDTH / 2, BOARD_HEIGHT / 2, img)
            .setOrigin(0.5)
            .setDepth(1000)
            .setVisible(false);

        // Input Handling
        this.input.on('pointerdown', this.handlePointerDown, this);

        // Auto-load
        this.loadGame();
    }

    createPieces() {
        // Clear existing if any (though create is called once usually)
        this.pieces.forEach(p => p.destroy());
        this.pieces.clear();

        for (let i = 0; i < 256; i++) {
            if (IN_BOARD(i)) {
                const pieceType = this.engine.getPiece(i);
                // Only create sprite if there is a piece? 
                // Excalibur created actors for ALL squares and just hid them/changed type.
                // Let's follow that pattern for simplicity of updates.
                const piece = new Piece(this, i, pieceType, this.isFlipped);
                if (pieceType === 0) piece.setVisible(false);
                this.pieces.set(i, piece);
            }
        }
    }

    handlePointerDown(pointer: Phaser.Input.Pointer) {
        if (this.busy) return;

        // Convert x,y to square
        // x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE
        // => file - 3 = (x - BOARD_OFFSET_X) / SQUARE_SIZE
        // => file = Math.floor(...) + 3

        const col = Math.floor((pointer.x - BOARD_OFFSET_X) / SQUARE_SIZE);
        const row = Math.floor((pointer.y - BOARD_OFFSET_Y) / SQUARE_SIZE);

        const file = col + 3;
        const rank = row + 3;

        if (file < 3 || file > 11 || rank < 3 || rank > 12) return;

        let sq = (rank << 4) + file;

        // Handle Flip
        if (this.isFlipped) {
            sq = 254 - sq;
        }

        if (!IN_BOARD(sq)) return;

        this.clickSquare(sq);
    }

    clickSquare(sq: number) {
        const pc = this.engine.getPiece(sq);
        const selfSide = SIDE_TAG(this.engine.sdPlayer);

        if ((pc & selfSide) !== 0) {
            // Clicked own piece -> Select
            this.playSound('click');
            this.selectedSq = sq;
            this.updateSelection();
        } else if (this.selectedSq > 0) {
            // Clicked other square -> Try Move
            this.makeMove(this.selectedSq, sq);
        }
    }

    updateSelection() {
        // Hide all valid move markers
        this.validMoveMarkers.forEach(m => m.setVisible(false));

        if (this.selectedSq === 0) {
            this.selectionMarker.setVisible(false);
            return;
        }

        const _displaySq = this.isFlipped ? 254 - this.selectedSq : this.selectedSq;
        // Re-use logic from Piece or just calculate
        // We can just ask the piece at that square for its position?
        // But the piece might be hidden (if we selected an empty square? No, we only select own pieces).
        // Wait, we only select own pieces.

        const piece = this.pieces.get(this.selectedSq);
        if (piece) {
            this.selectionMarker.setPosition(piece.x, piece.y);
            this.selectionMarker.setVisible(true);

            // Show valid moves
            const moves = this.engine.getLegalMovesForPiece(this.selectedSq);
            moves.forEach((mv, index) => {
                if (index < this.validMoveMarkers.length) {
                    const dst = DST(mv);
                    const displayDst = this.isFlipped ? 254 - dst : dst;

                    // Calculate position
                    // TODO: Refactor coordinate calculation to a helper if used often
                    // But for now, let's just use the same logic as Piece or handlePointerDown reverse

                    const file = displayDst & 0xF;
                    const rank = displayDst >> 4;

                    const x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE + SQUARE_SIZE / 2;
                    const y = BOARD_OFFSET_Y + (rank - 3) * SQUARE_SIZE + SQUARE_SIZE / 2;

                    this.validMoveMarkers[index].setPosition(x, y).setVisible(true);
                }
            });
        }
    }

    async makeMove(src: number, dst: number) {
        const mv = MOVE(src, dst);
        if (!this.engine.legalMove(mv)) {
            this.selectedSq = 0;
            this.updateSelection();
            return;
        }

        if (!this.engine.makeInternalMove(mv)) {
            this.playSound('illegal');
            return;
        }

        // Move successful in engine. Animate it.
        this.busy = true;
        await this.animateMove(src, dst);

        // Update Board State (Sync all pieces)
        this.flushBoard();

        this.playSound('move'); // Simplified sound logic for now

        this.selectedSq = 0;
        this.updateSelection();

        // Check Game Over / Response
        this.checkGameState();
        this.saveGame();
    }

    async animateMove(src: number, dst: number) {
        const piece = this.pieces.get(src);
        const targetPiece = this.pieces.get(dst); // Might be captured

        if (!piece) return;

        // Calculate target position
        // We can use the target piece's position if it exists (even if empty/hidden)
        // Or calculate manually.
        // Since we created pieces for all squares, targetPiece should exist.

        const targetX = targetPiece!.x;
        const targetY = targetPiece!.y;

        piece.setDepth(100); // Bring to top

        if (!this.animated) {
            piece.setPosition(targetX, targetY);
            piece.setDepth(10);
            return Promise.resolve();
        }

        return new Promise<void>(resolve => {
            this.tweens.add({
                targets: piece,
                x: targetX,
                y: targetY,
                duration: 200,
                onComplete: () => {
                    piece.setDepth(10);
                    resolve();
                }
            });
        });
    }

    flushBoard() {
        // Sync all sprites with engine state
        for (let i = 0; i < 256; i++) {
            if (IN_BOARD(i)) {
                const pc = this.engine.getPiece(i);
                const sprite = this.pieces.get(i);
                if (sprite) {
                    sprite.setPiece(pc);
                    // Also update position in case of undo/reset (though animateMove handles x/y)
                    // But animateMove only moved the source sprite.
                    // After move, the piece is logically at dst.
                    // But our `pieces` map is keyed by SQUARE INDEX.
                    // So `pieces.get(src)` should now show EMPTY.
                    // And `pieces.get(dst)` should now show the PIECE.
                    // Wait, my `pieces` map is static: index -> Sprite.
                    // So I just need to update the texture/visibility of each sprite based on the engine content at that index.
                    // AND reset their positions to their "home" squares (because animateMove moved the sprite physically).

                    sprite.updatePosition();
                }
            }
        }
    }

    checkGameState() {
        if (this.engine.isMate()) {
            const computerMove = this.computerMove();
            this.playSound(computerMove ? "win" : "loss");
            // Alert or UI update for game over
            alert(computerMove ? "你赢了！" : "你输了！");
            this.busy = false;
            return;
        }

        let vlRep = this.engine.repStatus(3);
        if (vlRep > 0) {
            vlRep = this.engine.repValue(vlRep);
            const WIN_VALUE_THRESHOLD = 9000;
            if (vlRep > -WIN_VALUE_THRESHOLD && vlRep < WIN_VALUE_THRESHOLD) {
                this.playSound("draw");
                alert("双方不变作和");
            } else if (this.computerMove() === (vlRep < 0)) {
                this.playSound("loss");
                alert("长打作负");
            } else {
                this.playSound("win");
                alert("长打作负"); // Opponent loses
            }
            this.busy = false;
            return;
        }

        if (this.engine.inCheck()) {
            this.playSound(this.computerMove() ? "check2" : "check");
        } else if (this.engine.captured()) {
            this.playSound(this.computerMove() ? "capture2" : "capture");
        } else {
            this.playSound(this.computerMove() ? "move2" : "move");
        }

        this.events.emit('update-score', this.engine.getScores());
        this.events.emit('update-moves', this.getMoveList());

        this.response();
    }



    response() {
        if (!this.computerMove()) {
            this.busy = false;
            return;
        }

        this.thinkingMarker.setVisible(true);
        this.busy = true;

        // Use setTimeout to allow UI to update and show thinking marker
        setTimeout(() => {
            const ucciMove = this.engine.findBestMove(64, 1000); // 1s thinking time
            this.thinkingMarker.setVisible(false);

            if (ucciMove === "nomove") {
                this.busy = false;
                return;
            }

            const internalMove = this.engine.ucciMoveToInternal(ucciMove);
            this.addMove(internalMove);
        }, 250);
    }

    async addMove(mv: number) {
        if (!this.engine.legalMove(mv)) return;
        if (!this.engine.makeInternalMove(mv)) return;

        this.busy = true;
        await this.animateMove(SRC(mv), DST(mv));
        this.flushBoard();
        this.checkGameState();
    }

    // --- Public API for UI ---

    // --- Public API for UI ---

    public retract() {
        if (this.engine.getHistoryLength() > 1) {
            // Always undo at least one move
            this.engine.undoInternalMove();

            // If HvAI (moveMode != 2), try to undo a second move to get back to player's turn
            // But only if there is enough history (history length > 1 means at least 1 move made, 
            // but we just undid one. We need at least one more move to undo.)
            // Actually getHistoryLength counts moves. Start is 0? No, mvList init with [0].
            // So length 1 = start. Length 2 = 1 move made.
            // If we undid one, length decreased by 1.
            // If length > 1, we can undo again.
            if (this.moveMode !== 2 && this.engine.getHistoryLength() > 1) {
                this.engine.undoInternalMove();
            }

            this.flushBoard();
            this.events.emit('update-score', this.engine.getScores());
            this.events.emit('update-moves', this.getMoveList());
        }
    }

    public animated: boolean = true;

    public setAnimated(enabled: boolean) {
        this.animated = enabled;
        this.saveGame();
    }

    public recommend() {
        if (this.busy) return;

        // Don't recommend if game over
        if (this.engine.isMate() || this.engine.repStatus(3) > 0) return;

        // Clear selection and valid move markers before executing the recommended move
        this.selectedSq = 0;
        this.updateSelection();

        this.thinkingMarker.setVisible(true);
        this.busy = true;

        setTimeout(() => {
            const ucciMove = this.engine.findBestMove(64, 1000); // 1s thinking time
            this.thinkingMarker.setVisible(false);
            this.busy = false;

            if (ucciMove !== "nomove") {
                const internalMove = this.engine.ucciMoveToInternal(ucciMove);
                // Execute the move directly
                this.addMove(internalMove);
            }
        }, 100);
    }

    public getScores() {
        return this.engine.getScores();
    }

    public getMoveList() {
        return this.engine.getMoveList().map(m => {
            const ucci = this.engine.moveToString(m);
            // Format: a0i9 -> A0-I9
            return `${ucci.slice(0, 2).toUpperCase()} -${ucci.slice(2, 4).toUpperCase()} `;
        });
    }

    playSound(key: string) {
        if (this.soundEnabled) {
            this.sound.play(key);
        }
    }

    // --- Settings & State ---
    public soundEnabled: boolean = true;
    public difficulty: number = 100; // millis (Default: Amateur)
    public moveMode: number = 0; // 0: User first, 1: Computer first, 2: No Computer
    public handicap: number = 0; // 0: None, 1: Left Knight, 2: Double Knights, 3: Nine Pieces
    public showScore: boolean = true;

    private readonly STARTUP_FEN = [
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1", // No Handicap
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKABNR w - - 0 1", // Left Knight
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKAB1R w - - 0 1", // Double Knights
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w - - 0 1",           // Nine Pieces
    ];

    public setSound(enabled: boolean) {
        this.soundEnabled = enabled;
        this.saveGame();
    }

    public setDifficulty(level: number) {
        // level: 0=Easy(10ms), 1=Normal(100ms), 2=Hard(1000ms)
        this.difficulty = 10 ** (level + 1);
        this.saveGame();
    }

    public setMoveMode(mode: number) {
        this.moveMode = mode;
        this.saveGame();
    }

    public setHandicap(handicap: number) {
        this.handicap = handicap;
        this.saveGame();
    }

    public setShowScore(show: boolean) {
        this.showScore = show;
        this.saveGame();
        this.events.emit('update-settings');
    }

    private initialFen: string = "";

    public restart() {
        this.engine = new XiangQiEngine(); // Reset engine

        // Apply Handicap
        const fen = this.STARTUP_FEN[this.handicap] || this.STARTUP_FEN[0];
        this.initialFen = fen;
        this.engine.loadFen(fen);

        this.createPieces(); // Reset pieces
        this.selectedSq = 0;
        this.updateSelection();
        this.busy = false;

        // Handle Move Mode (Computer First)
        if (this.moveMode === 1) {
            this.response();
        } else {
            this.checkGameState();
        }

        this.events.emit('update-score', this.engine.getScores());
        this.events.emit('update-moves', this.getMoveList());
        this.saveGame();
    }

    computerMove() {
        let computerSide = 1; // Default Black
        if (this.moveMode === 1) computerSide = 0; // Computer is Red
        if (this.moveMode === 2) return false; // No Computer

        return this.engine.sdPlayer === computerSide;
    }

    public loadGame() {
        const savedData = localStorage.getItem('xqlightweight_game_state');
        if (savedData) {
            try {
                // Try parsing as JSON
                const gameState = JSON.parse(savedData);

                // Restore settings
                if (gameState.handicap !== undefined) this.handicap = gameState.handicap;
                if (gameState.moveMode !== undefined) this.moveMode = gameState.moveMode;
                if (gameState.difficulty !== undefined) this.difficulty = gameState.difficulty;
                if (gameState.soundEnabled !== undefined) this.soundEnabled = gameState.soundEnabled;
                if (gameState.animated !== undefined) this.animated = gameState.animated;
                if (gameState.showScore !== undefined) this.showScore = gameState.showScore;

                // Restore Game
                if (gameState.initialFen && gameState.moves) {
                    this.initialFen = gameState.initialFen;
                    this.engine.loadFen(this.initialFen);

                    // Replay moves
                    for (const ucci of gameState.moves) {
                        const mv = this.engine.ucciMoveToInternal(ucci);
                        this.engine.makeInternalMove(mv);
                    }
                } else if (gameState.fen) {
                    // Legacy or simple FEN
                    this.engine.loadFen(gameState.fen);
                    this.initialFen = gameState.fen; // Assume current is initial if no history
                }

                this.createPieces();
                this.flushBoard();
                this.checkGameState();
                this.events.emit('update-score', this.engine.getScores());
                this.events.emit('update-moves', this.getMoveList());

            } catch (_e) {
                // Fallback for legacy plain string FEN
                if (this.engine.loadFen(savedData)) {
                    this.initialFen = savedData;
                    this.createPieces();
                    this.flushBoard();
                    this.checkGameState();
                    this.events.emit('update-score', this.engine.getScores());
                    this.events.emit('update-moves', this.getMoveList());
                }
            }
        } else {
            // No save, start fresh
            this.restart();
        }
    }

    public saveGame() {
        const moves = this.engine.getMoveList()
            .filter(m => m > 0) // Filter out dummy move 0
            .map(m => this.engine.moveToString(m));

        const gameState = {
            fen: this.engine.getFen(),
            initialFen: this.initialFen || this.engine.getFen(),
            moves: moves,
            handicap: this.handicap,
            moveMode: this.moveMode,
            difficulty: this.difficulty,
            soundEnabled: this.soundEnabled,
            animated: this.animated,
            showScore: this.showScore
        };
        localStorage.setItem('xqlightweight_game_state', JSON.stringify(gameState));
    }
}
