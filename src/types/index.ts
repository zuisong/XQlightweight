// src/types/index.ts
// 统一导出所有类型

// 引擎类型 (从 engine/types 重新导出)
export type {
    GameScores,
    GameStatus,
    Move,
    PieceType,
    Side,
    Square,
} from '../engine/types';

export {
    BLACK_PIECES,
    BLACK_SIDE,
    createMove,
    createSquare,
    EMPTY_PIECE,
    getMoveDestination,
    getMoveSource,
    getSquareFile,
    getSquareRank,
    isValidSquare,
    RED_PIECES,
    RED_SIDE,
    unsafeMove,
    unsafeSquare,
} from '../engine/types';

// UI 类型
export type {
    Difficulty,
    GameState,
    Handicap,
    MoveMode,
} from './ui.types';
