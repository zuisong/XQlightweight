import { Howl } from 'howler';
import { type Application, Assets, Container, Sprite, Texture } from 'pixi.js';
import { type GifSource, GifSprite } from 'pixi.js/gif';
import { BOARD_HEIGHT, BOARD_OFFSET_X, BOARD_OFFSET_Y, BOARD_WIDTH, PIECE_IMAGE_MAP, SQUARE_SIZE, THINKING_SIZE } from '../constants';
import { XiangQiEngine } from '../engine/index';
import { DST, IN_BOARD, MOVE, SIDE_TAG, SRC } from '../engine/position';
import { PixiPiece } from './PixiPiece';

export class PixiManager {
    private app: Application;
    private engine: XiangQiEngine;
    private pieces: Map<number, PixiPiece> = new Map();
    private selectedSq: number = 0;
    private selectionMarker!: GifSprite;
    private thinkingMarker!: GifSprite;
    private isFlipped: boolean = false;
    private busy: boolean = false;
    private piecesContainer!: Container;

    // Settings
    public soundEnabled: boolean = true;
    public difficulty: number = 100;
    public moveMode: number = 0;
    public handicap: number = 0;
    public showScore: boolean = true;
    public animated: boolean = true;

    private sounds: Map<string, Howl> = new Map();
    private initialFen: string = "";

    // Event listeners
    private listeners: Map<string, Set<Function>> = new Map();

    private readonly STARTUP_FEN = [
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1", // No Handicap
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKABNR w - - 0 1", // Left Knight
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKAB1R w - - 0 1", // Double Knights
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w - - 0 1",           // Nine Pieces
    ];

    constructor(app: Application) {
        this.app = app;
        this.engine = new XiangQiEngine();
    }

    async init() {
        await this.loadAssets();
        this.create();
    }

    async loadAssets() {
        const manifest = [
            { alias: 'board', src: 'images/board.jpg' },
            { alias: 'oos', src: 'images/oos.gif' },
            { alias: 'oo', src: 'images/oo.gif' },
            { alias: 'thinking', src: 'images/thinking.gif' },
            ...Object.values(PIECE_IMAGE_MAP)
                .filter(val => val !== 'oo') // Avoid duplicate if it was there
                .map(val => ({ alias: val, src: `images/${val}.gif` }))
        ];

        // Register assets first
        manifest.forEach(asset => {
            console.log('Registering asset:', asset.alias, asset.src);
            Assets.add({ alias: asset.alias, src: asset.src });
        });

        // Load all assets by alias
        try {
            const loaded = await Assets.load(manifest.map(m => m.alias));
            console.log('Loaded assets keys:', Object.keys(loaded));
        } catch (e) {
            console.error('Failed to load assets:', e);
        }

        const soundKeys = ['capture', 'capture2', 'check', 'check2', 'click', 'draw', 'illegal', 'loss', 'move', 'move2', 'newgame', 'win'];
        soundKeys.forEach(key => {
            this.sounds.set(key, new Howl({ src: [`sounds/${key}.wav`] }));
        });
    }

    create() {
        this.app.stage.sortableChildren = true; // Enable z-index sorting for the stage

        const board = Sprite.from('board');
        board.zIndex = 0;
        this.app.stage.addChild(board);

        // Debug: Check if 'oos' is available
        const oosAsset = Assets.get<GifSource>('oos');
        console.log('OOS Asset:', oosAsset);

        this.selectionMarker = new GifSprite(oosAsset);

        this.selectionMarker.visible = false;
        this.selectionMarker.zIndex = 15; // Above pieces (10)
        this.app.stage.addChild(this.selectionMarker);

        this.piecesContainer = new Container();
        this.piecesContainer.sortableChildren = true;
        this.piecesContainer.zIndex = 10;
        this.app.stage.addChild(this.piecesContainer);

        this.createPieces();

        // Thinking Marker
        const thinkingAsset = Assets.get<GifSource>('thinking');
        this.thinkingMarker = new GifSprite(thinkingAsset);
        this.thinkingMarker.width = THINKING_SIZE;
        this.thinkingMarker.height = THINKING_SIZE;
        this.thinkingMarker.anchor.set(0.5);
        this.thinkingMarker.position.set(BOARD_WIDTH / 2, BOARD_HEIGHT / 2);
        this.thinkingMarker.visible = false;
        this.thinkingMarker.zIndex = 20; // Topmost
        this.app.stage.addChild(this.thinkingMarker);

        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
        // this.app.stage.on('pointerdown', this.handlePointerDown.bind(this)); // Removed in favor of piece clicks

        this.loadGame();
    }

    createPieces() {
        this.pieces.forEach(p => p.destroy());
        this.pieces.clear();
        this.piecesContainer.removeChildren();

        for (let i = 0; i < 256; i++) {
            if (IN_BOARD(i)) {
                const pieceType = this.engine.getPiece(i);
                // Pass the click handler
                const piece = new PixiPiece(i, pieceType, (sq) => this.clickSquare(sq), this.isFlipped);
                // if (pieceType === 0) piece.visible = false; // Allow empty pieces to be visible (oo.gif)
                this.pieces.set(i, piece);
                this.piecesContainer.addChild(piece);
            }
        }
    }

    // handlePointerDown removed - using direct piece interaction


    clickSquare(sq: number) {
        const pc = this.engine.getPiece(sq);
        const selfSide = SIDE_TAG(this.engine.sdPlayer);

        console.log('Click Square:', sq, 'Piece:', pc, 'SelfSide:', selfSide, 'SelectedSq:', this.selectedSq);

        if ((pc & selfSide) !== 0) {
            this.playSound('click');
            this.selectedSq = sq;
            this.updateSelection();
            console.log('Selected piece at', sq);
        } else if (this.selectedSq > 0) {
            console.log('Attempting move from', this.selectedSq, 'to', sq);
            this.makeMove(this.selectedSq, sq);
        } else {
            console.log('Ignored click (not self piece and no selection)');
        }
    }

    updateSelection() {
        if (this.selectedSq === 0) {
            this.selectionMarker.visible = false;
            return;
        }

        const piece = this.pieces.get(this.selectedSq);
        if (piece) {
            this.selectionMarker.position.set(piece.x, piece.y);
            this.selectionMarker.visible = true;
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

        this.busy = true;
        await this.animateMove(src, dst);

        this.flushBoard();
        this.playSound('move');

        this.selectedSq = 0;
        this.updateSelection();

        this.checkGameState();
        this.saveGame();
    }

    async animateMove(src: number, dst: number) {
        const piece = this.pieces.get(src);
        const targetPiece = this.pieces.get(dst);

        if (!piece || !targetPiece) return;

        const targetX = targetPiece.x;
        const targetY = targetPiece.y;

        piece.zIndex = 100;

        if (!this.animated) {
            piece.position.set(targetX, targetY);
            piece.zIndex = 10;
            return Promise.resolve();
        }

        return new Promise<void>(resolve => {
            const startX = piece.x;
            const startY = piece.y;
            const startTime = Date.now();
            const duration = 200;

            const animate = () => {
                const now = Date.now();
                const progress = Math.min((now - startTime) / duration, 1);

                piece.x = startX + (targetX - startX) * progress;
                piece.y = startY + (targetY - startY) * progress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    piece.zIndex = 10;
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }

    flushBoard() {
        for (let i = 0; i < 256; i++) {
            if (IN_BOARD(i)) {
                const pc = this.engine.getPiece(i);
                const sprite = this.pieces.get(i);
                if (sprite) {
                    sprite.setPiece(pc);
                    sprite.updatePosition();
                }
            }
        }
    }

    checkGameState() {
        if (this.engine.isMate()) {
            const computerMove = this.computerMove();
            this.playSound(computerMove ? "loss" : "win");
            console.log(computerMove ? "You Lost!" : "You Won!");
            this.busy = false;
            return;
        }

        let vlRep = this.engine.repStatus(3);
        if (vlRep > 0) {
            vlRep = this.engine.repValue(vlRep);
            const WIN_VALUE_THRESHOLD = 9000;
            if (vlRep > -WIN_VALUE_THRESHOLD && vlRep < WIN_VALUE_THRESHOLD) {
                this.playSound("draw");
            } else if (this.computerMove() === (vlRep < 0)) {
                this.playSound("loss");
            } else {
                this.playSound("win");
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

        this.emit('update-score', this.engine.getScores());
        this.emit('update-moves', this.getMoveList());

        this.response();
    }

    response() {
        if (!this.computerMove()) {
            this.busy = false;
            return;
        }

        if (this.thinkingMarker) this.thinkingMarker.visible = true;
        this.busy = true;

        setTimeout(() => {
            const ucciMove = this.engine.findBestMove(64, 1000);
            if (this.thinkingMarker) this.thinkingMarker.visible = false;

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

    // --- Public API ---

    public retract() {
        if (this.engine.getHistoryLength() > 1) {
            this.engine.undoInternalMove();
            // If PvE (moveMode 0 or 1), undo again to revert user's move
            if (this.moveMode === 0 || this.moveMode === 1) {
                if (this.engine.getHistoryLength() > 0) {
                    this.engine.undoInternalMove();
                }
            }
            this.flushBoard();
            this.emit('update-score', this.engine.getScores());
            this.emit('update-moves', this.getMoveList());
        }
    }

    public setAnimated(enabled: boolean) {
        this.animated = enabled;
        this.saveGame();
    }

    public recommend() {
        if (this.busy) return;
        if (this.engine.isMate() || this.engine.repStatus(3) > 0) return;

        if (this.thinkingMarker) this.thinkingMarker.visible = true;
        this.busy = true;

        setTimeout(() => {
            const ucciMove = this.engine.findBestMove(64, 1000);
            if (this.thinkingMarker) this.thinkingMarker.visible = false;
            this.busy = false;

            if (ucciMove !== "nomove") {
                const internalMove = this.engine.ucciMoveToInternal(ucciMove);
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
            return ucci.slice(0, 2).toUpperCase() + '-' + ucci.slice(2, 4).toUpperCase();
        });
    }

    playSound(key: string) {
        if (this.soundEnabled) {
            this.sounds.get(key)?.play();
        }
    }

    public setSound(enabled: boolean) {
        this.soundEnabled = enabled;
        this.saveGame();
    }

    public setDifficulty(level: number) {
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
        this.emit('update-settings');
    }

    public restart() {
        this.engine = new XiangQiEngine();
        const fen = this.STARTUP_FEN[this.handicap] || this.STARTUP_FEN[0];
        this.initialFen = fen;
        this.engine.loadFen(fen);

        this.createPieces();
        this.selectedSq = 0;
        this.updateSelection();
        this.busy = false;

        if (this.moveMode === 1) {
            this.response();
        } else {
            this.checkGameState();
        }

        this.emit('update-score', this.engine.getScores());
        this.emit('update-moves', this.getMoveList());
        this.saveGame();
    }

    computerMove() {
        let computerSide = 1;
        if (this.moveMode === 1) computerSide = 0;
        if (this.moveMode === 2) return false;
        return this.engine.sdPlayer === computerSide;
    }

    public loadGame() {
        const savedData = localStorage.getItem('xqlightweight_game_state');
        if (savedData) {
            try {
                const gameState = JSON.parse(savedData);
                if (gameState.handicap !== undefined) this.handicap = gameState.handicap;
                if (gameState.moveMode !== undefined) this.moveMode = gameState.moveMode;
                if (gameState.difficulty !== undefined) this.difficulty = gameState.difficulty;
                if (gameState.soundEnabled !== undefined) this.soundEnabled = gameState.soundEnabled;
                if (gameState.animated !== undefined) this.animated = gameState.animated;
                if (gameState.showScore !== undefined) this.showScore = gameState.showScore;

                if (gameState.initialFen && gameState.moves) {
                    this.initialFen = gameState.initialFen;
                    this.engine.loadFen(this.initialFen);
                    for (const ucci of gameState.moves) {
                        const mv = this.engine.ucciMoveToInternal(ucci);
                        this.engine.makeInternalMove(mv);
                    }
                } else if (gameState.fen) {
                    this.engine.loadFen(gameState.fen);
                    this.initialFen = gameState.fen;
                }

                this.createPieces();
                this.flushBoard();
                this.checkGameState();
                this.emit('update-score', this.engine.getScores());
                this.emit('update-moves', this.getMoveList());

            } catch (e) {
                if (this.engine.loadFen(savedData)) {
                    this.initialFen = savedData;
                    this.createPieces();
                    this.flushBoard();
                    this.checkGameState();
                    this.emit('update-score', this.engine.getScores());
                    this.emit('update-moves', this.getMoveList());
                }
            }
        } else {
            this.restart();
        }
    }

    public saveGame() {
        const moves = this.engine.getMoveList()
            .filter(m => m > 0)
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

    // Event Emitter shim
    public events = {
        on: (event: string, fn: Function) => {
            if (!this.listeners.has(event)) this.listeners.set(event, new Set());
            this.listeners.get(event)?.add(fn);
        },
        off: (event: string, fn: Function) => {
            this.listeners.get(event)?.delete(fn);
        }
    };

    private emit(event: string, ...args: any[]) {
        this.listeners.get(event)?.forEach(fn => fn(...args));
    }
}
