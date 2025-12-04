import { Assets, Container, type Sprite, Texture } from 'pixi.js';
import { type GifSource, GifSprite } from 'pixi.js/gif';
import { BOARD_OFFSET_X, BOARD_OFFSET_Y, PIECE_IMAGE_MAP, SQUARE_SIZE } from '../constants';
import type { PieceType } from '../engine';
import { FILE_X, RANK_Y } from '../engine/position';

export class PixiPiece extends Container {
    public sq: number;
    public pieceType: PieceType;
    private _flipped: boolean;
    private visual: Container | Sprite | GifSprite | null = null;

    constructor(sq: number, pieceType: PieceType, onSelect: (sq: number) => void, flipped: boolean = false) {
        super();
        this.sq = sq;
        this.pieceType = pieceType;
        this._flipped = flipped;

        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', () => onSelect(this.sq));

        this.updatePosition();
        this.setPiece(pieceType);
    }

    updatePosition() {
        const displaySq = this._flipped ? 254 - this.sq : this.sq;
        const file = FILE_X(displaySq);
        const rank = RANK_Y(displaySq);

        this.x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE;
        this.y = BOARD_OFFSET_Y + (rank - 3) * SQUARE_SIZE;
    }

    setPiece(type: PieceType) {
        this.pieceType = type;
        const textureKey = PIECE_IMAGE_MAP[type];

        // Remove existing visual
        if (this.visual) {
            this.visual.destroy();
            this.visual = null;
        }

        if (textureKey) {
            const asset = Assets.get<GifSource>(textureKey);
            if (asset) {
                this.visual = new GifSprite(asset);

                if (this.visual) {
                    this.addChild(this.visual);
                    this.visible = true;
                }
            } else {
                console.warn(`Asset not found for key: ${textureKey} (type: ${type})`);
                this.visible = true; // Keep visible?
            }
        } else {
            this.visible = false;
        }
    }
}
