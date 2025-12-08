// src/types/game.types.ts
// 品牌类型 (Branded Types) - 提供编译时类型安全

/**
 * 棋盘坐标 (0-255)
 * 内部表示: rank(4位) + file(4位)
 * 有效范围: rank 3-12, file 3-11
 */
export type Square = number & { readonly __brand: 'Square' };

/**
 * 移动
 * 内部表示: src(8位) + dst(8位)
 */
export type Move = number & { readonly __brand: 'Move' };

/**
 * 棋子类型
 * 0: 空
 * 8-14: 红方棋子
 * 16-22: 黑方棋子
 */
export type PieceType =
    | 0   // Empty
    | 8   // Red King
    | 9   // Red Advisor
    | 10  // Red Bishop
    | 11  // Red Knight
    | 12  // Red Rook
    | 13  // Red Cannon
    | 14  // Red Pawn
    | 16  // Black King
    | 17  // Black Advisor
    | 18  // Black Bishop
    | 19  // Black Knight
    | 20  // Black Rook
    | 21  // Black Cannon
    | 22; // Black Pawn

/**
 * 玩家方 (0: 红方, 1: 黑方)
 */
export type Side = 0 | 1;

/**
 * 移动模式
 * 0: 玩家先手
 * 1: 电脑先手
 * 2: 双人对战
 */
export type MoveMode = 0 | 1 | 2;

/**
 * 让子模式
 * 0: 无让子
 * 1: 让左马
 * 2: 让双马
 * 3: 让九子
 */
export type Handicap = 0 | 1 | 2 | 3;

/**
 * 难度等级
 * 0: 简单 (10ms)
 * 1: 普通 (100ms)
 * 2: 困难 (1000ms)
 */
export type Difficulty = 0 | 1 | 2;

// ============ 工厂函数 ============

/**
 * 创建棋盘坐标
 * @param rank 行 (3-12)
 * @param file 列 (3-11)
 */
export function createSquare(rank: number, file: number): Square {
    if (rank < 3 || rank > 12 || file < 3 || file > 11) {
        throw new Error(`Invalid square coordinates: rank=${rank}, file=${file}`);
    }
    return ((rank << 4) + file) as Square;
}

/**
 * 从原始数值创建棋盘坐标 (不进行验证,用于已知有效的值)
 */
export function unsafeSquare(value: number): Square {
    return value as Square;
}

/**
 * 创建移动
 * @param src 起始坐标
 * @param dst 目标坐标
 */
export function createMove(src: Square, dst: Square): Move {
    return ((src as number) + ((dst as number) << 8)) as Move;
}

/**
 * 从原始数值创建移动 (不进行验证)
 */
export function unsafeMove(value: number): Move {
    return value as Move;
}

// ============ 提取函数 ============

/**
 * 从移动中提取起始坐标
 */
export function getMoveSource(move: Move): Square {
    return ((move as number) & 0xFF) as Square;
}

/**
 * 从移动中提取目标坐标
 */
export function getMoveDestination(move: Move): Square {
    return ((move as number) >> 8) as Square;
}

/**
 * 从坐标中提取行
 */
export function getSquareRank(square: Square): number {
    return (square >> 4) & 0xF;
}

/**
 * 从坐标中提取列
 */
export function getSquareFile(square: Square): number {
    return square & 0xF;
}

/**
 * 检查坐标是否在棋盘内
 */
export function isValidSquare(square: Square): boolean {
    const rank = getSquareRank(square);
    const file = getSquareFile(square);
    return rank >= 3 && rank <= 12 && file >= 3 && file <= 11;
}

// ============ 游戏状态类型 ============

export interface GameState {
    fen: string;
    initialFen: string;
    moves: string[];
    handicap: Handicap;
    moveMode: MoveMode;
    difficulty: number;
    soundEnabled: boolean;
    animated: boolean;
    showScore: boolean;
}

export interface GameScores {
    red: number;
    black: number;
}

export interface GameStatus {
    isMate: boolean;
    inCheck: boolean;
}

// ============ 常量 ============

export const EMPTY_PIECE: PieceType = 0;

export const RED_PIECES = {
    KING: 8 as PieceType,
    ADVISOR: 9 as PieceType,
    BISHOP: 10 as PieceType,
    KNIGHT: 11 as PieceType,
    ROOK: 12 as PieceType,
    CANNON: 13 as PieceType,
    PAWN: 14 as PieceType,
} as const;

export const BLACK_PIECES = {
    KING: 16 as PieceType,
    ADVISOR: 17 as PieceType,
    BISHOP: 18 as PieceType,
    KNIGHT: 19 as PieceType,
    ROOK: 20 as PieceType,
    CANNON: 21 as PieceType,
    PAWN: 22 as PieceType,
} as const;

export const RED_SIDE: Side = 0;
export const BLACK_SIDE: Side = 1;
