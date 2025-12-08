// src/core/StorageManager.ts
// 本地存储管理器 - 负责游戏状态的保存和加载

import type { GameState } from '../types/ui.types';

export class StorageManager {
    private readonly STORAGE_KEY = 'xqlightweight_game_state';

    /**
     * 保存游戏状态到 localStorage
     */
    save(state: GameState): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('[StorageManager] Failed to save game state:', error);
        }
    }

    /**
     * 从 localStorage 加载游戏状态
     */
    load(): GameState | null {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (!savedData) {
                return null;
            }

            return JSON.parse(savedData) as GameState;
        } catch (error) {
            console.error('[StorageManager] Failed to load game state:', error);
            return null;
        }
    }

    /**
     * 清除保存的游戏状态
     */
    clear(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('[StorageManager] Failed to clear game state:', error);
        }
    }

    /**
     * 检查是否有保存的游戏状态
     */
    hasSavedGame(): boolean {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }
}
