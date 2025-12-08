import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import UI from '../UI';
import { EVENTS } from '../../game/events';

// Mock child components to isolate UI logic
vi.mock('../SettingsModal', () => ({
    default: ({ isOpen }: any) => isOpen ? <div>游戏设置</div> : null
}));

vi.mock('../RestartModal', () => ({
    default: ({ isOpen }: any) => isOpen ? <div>确认要重新开始</div> : null
}));

// Mock Data and Types
const createMockScene = () => ({
    events: {
        on: vi.fn(),
        off: vi.fn(),
    },
    getScores: vi.fn(() => ({ red: 500, black: 500 })),
    showScore: true,
    soundEnabled: true,
    moveMode: 0,
    handicap: 0,
    animated: true,
    difficulty: 100,
    retract: vi.fn(),
    recommend: vi.fn(),
    setSound: vi.fn(),
    setDifficulty: vi.fn(),
    setAnimated: vi.fn(),
    setShowScore: vi.fn(),
    restart: vi.fn(),
});

describe('UI Component', () => {
    let mockGame: any;
    let mockScene: any;

    beforeEach(() => {
        mockScene = createMockScene();
        mockGame = {
            scene: {
                getScene: vi.fn((name: string) => {
                    if (name === 'MainScene') return mockScene;
                    return null;
                }),
            },
        };
    });

    afterEach(() => {
        cleanup();
    });

    describe('渲染', () => {
        it('应该正确渲染 UI', () => {
            const { container } = render(<UI gameInstance={mockGame} />);
            expect(container).toBeInTheDocument();
        });

        it('应该显示控制按钮', () => {
            render(<UI gameInstance={mockGame} />);
            expect(screen.getByText('设置')).toBeInTheDocument();
            expect(screen.getByText('重开')).toBeInTheDocument();
            expect(screen.getByText('悔棋')).toBeInTheDocument();
            expect(screen.getByText('提示')).toBeInTheDocument();
        });

        it('gameInstance 为 null 时应该正常渲染', () => {
            const { container } = render(<UI gameInstance={null} />);
            expect(container).toBeInTheDocument();
        });
    });

    describe('分数显示', () => {
        it('showScore 为 true 时应该显示分数', async () => {
            const { container } = render(<UI gameInstance={mockGame} />);

            await waitFor(() => {
                // Check if progress bar container exists (using color from style)
                const scoreBar = container.querySelector('[style*="#FF6B6B"]');
                expect(scoreBar).toBeInTheDocument();
            });
        });

        it('应该显示红黑双方分数占比', async () => {
            render(<UI gameInstance={mockGame} />);
            const percentages = await screen.findAllByText('50%');
            expect(percentages.length).toBeGreaterThan(0);
        });

        it('分数更新时应该重新渲染', async () => {
            const { findByText } = render(<UI gameInstance={mockGame} />);

            // Trigger score update
            const onCalls = mockScene.events.on.mock.calls;
            const updateCallback = onCalls.find((call: any) => call[0] === EVENTS.UPDATE_SCORE)?.[1];

            if (updateCallback) {
                // Wrap in act since it triggers a state update
                act(() => {
                    updateCallback({ red: 700, black: 300 });
                });
            }

            // Wait for new percentages
            const percent70 = await findByText('70%');
            const percent30 = await findByText('30%');
            expect(percent70).toBeInTheDocument();
            expect(percent30).toBeInTheDocument();
        });
    });

    describe('按钮交互', () => {
        it('点击设置按钮应该打开设置模态框', async () => {
            render(<UI gameInstance={mockGame} />);

            const settingsButton = screen.getByText('设置');
            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText('游戏设置')).toBeInTheDocument();
            });
        });

        it('点击重开按钮应该打开确认模态框', async () => {
            render(<UI gameInstance={mockGame} />);

            const restartButton = screen.getByText('重开');
            fireEvent.click(restartButton);

            await waitFor(() => {
                expect(screen.getByText('确认要重新开始')).toBeInTheDocument();
            });
        });

        it('点击悔棋按钮应该调用 scene.retract', () => {
            render(<UI gameInstance={mockGame} />);
            const retractButton = screen.getByText('悔棋');
            fireEvent.click(retractButton);
            expect(mockScene.retract).toHaveBeenCalled();
        });

        it('点击提示按钮应该调用 scene.recommend', () => {
            render(<UI gameInstance={mockGame} />);
            const recommendButton = screen.getByText('提示');
            fireEvent.click(recommendButton);
            expect(mockScene.recommend).toHaveBeenCalled();
        });
    });

    describe('事件监听', () => {
        it('应该监听 update-score 事件', () => {
            render(<UI gameInstance={mockGame} />);
            expect(mockScene.events.on).toHaveBeenCalledWith(EVENTS.UPDATE_SCORE, expect.any(Function));
        });

        it('应该监听 update-settings 事件', () => {
            render(<UI gameInstance={mockGame} />);
            expect(mockScene.events.on).toHaveBeenCalledWith(EVENTS.UPDATE_SETTINGS, expect.any(Function));
        });

        it('组件卸载时应该移除事件监听', () => {
            const { unmount } = render(<UI gameInstance={mockGame} />);
            unmount();
            expect(mockScene.events.off).toHaveBeenCalledWith(EVENTS.UPDATE_SCORE, expect.any(Function));
            expect(mockScene.events.off).toHaveBeenCalledWith(EVENTS.UPDATE_SETTINGS, expect.any(Function));
        });
    });

    describe('边界情况', () => {
        it('scene 为 null 时按钮不应该崩溃', () => {
            const nullSceneGame = {
                scene: {
                    getScene: vi.fn(() => null)
                }
            };
            render(<UI gameInstance={nullSceneGame as any} />);

            expect(() => {
                fireEvent.click(screen.getByText('悔棋'));
                fireEvent.click(screen.getByText('提示'));
            }).not.toThrow();
        });
    });
});
