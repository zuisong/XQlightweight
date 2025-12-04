import Phaser from 'phaser';
import { BOARD_OFFSET_X, BOARD_OFFSET_Y, PIECE_IMAGE_MAP, SQUARE_SIZE } from '../constants';
import type { PieceType } from '../engine';
import { FILE_X, RANK_Y } from '../engine/position';

export class Piece extends Phaser.GameObjects.Sprite {
    public sq: number;
    public pieceType: PieceType;
    private _flipped: boolean;

    constructor(scene: Phaser.Scene, sq: number, pieceType: PieceType, flipped: boolean = false) {
        super(scene, 0, 0, PIECE_IMAGE_MAP[pieceType]);
        this.sq = sq;
        this.pieceType = pieceType;
        this._flipped = flipped;

        this.setOrigin(0, 0); // Top-left anchor to match Excalibur logic if needed, or Center?
        // Excalibur was Top-Left (Anchor Vector.Zero). Phaser default is Center (0.5).
        // Let's stick to Top-Left to match the coordinate calculation logic from Excalibur code
        // "this.pos.x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE;"

        this.updatePosition();

        scene.add.existing(this);
    }

    updatePosition() {
        const displaySq = this._flipped ? 254 - this.sq : this.sq;
        const file = FILE_X(displaySq);
        const rank = RANK_Y(displaySq);

        // Convert board coordinates to screen coordinates
        // Engine coordinates: file 3-11, rank 3-12
        // Screen coordinates offset: file-3, rank-3
        this.x = BOARD_OFFSET_X + (file - 3) * SQUARE_SIZE;
        this.y = BOARD_OFFSET_Y + (rank - 3) * SQUARE_SIZE;
    }

    setPiece(type: PieceType) {
        this.pieceType = type;
        const textureKey = PIECE_IMAGE_MAP[type];
        if (textureKey) {
            this.setTexture(textureKey);
            this.setVisible(true);
        } else {
            this.setVisible(false);
        }
    }
}
